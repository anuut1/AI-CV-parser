import math
import pytest
from evaluation.metrics import (
    dcg_at_k,
    idcg_at_k,
    ndcg_at_k,
    precision_at_k,
    reciprocal_rank,
    mean_reciprocal_rank,
    spearman_correlation,
)


def test_dcg_at_k_hand_computed():
    # Relevances: [3, 2, 0, 1]
    # i=1: (2^3 - 1) / log2(2) = 7 / 1 = 7.0
    # i=2: (2^2 - 1) / log2(3) = 3 / 1.584962500721156 = 1.8927892607143721
    # i=3: (2^0 - 1) / log2(4) = 0
    # i=4: (2^1 - 1) / log2(5) = 1 / 2.321928094887362 = 0.43067655807339306
    rels = [3, 2, 0, 1]
    expected_dcg_2 = 7.0 + 3.0 / math.log2(3)
    assert math.isclose(dcg_at_k(rels, k=2), expected_dcg_2, rel_tol=1e-7)

    expected_dcg_4 = 7.0 + (3.0 / math.log2(3)) + 0.0 + (1.0 / math.log2(5))
    assert math.isclose(dcg_at_k(rels, k=4), expected_dcg_4, rel_tol=1e-7)


def test_idcg_and_ndcg_perfect_ranking():
    rels = [3, 2, 0, 1]
    # Top 2 ideal sorted: [3, 2]
    # Since rels[:2] is already [3, 2], NDCG@2 must be exactly 1.0
    assert math.isclose(ndcg_at_k(rels, k=2), 1.0, rel_tol=1e-7)


def test_ndcg_inverted_ranking_hand_computed():
    # Ranked: [1, 3, 0]
    # Ideal: [3, 1, 0]
    # DCG@3 for [1, 3, 0]:
    #   i=1: (2^1 - 1)/1 = 1.0
    #   i=2: (2^3 - 1)/log2(3) = 7 / 1.58496250072 = 4.416508275
    #   i=3: (2^0 - 1)/log2(4) = 0.0
    #   Total DCG = 5.416508275
    # IDCG@3 for [3, 1, 0]:
    #   i=1: (2^3 - 1)/1 = 7.0
    #   i=2: (2^1 - 1)/log2(3) = 1 / 1.58496250072 = 0.6309297536
    #   i=3: 0.0
    #   Total IDCG = 7.6309297536
    # NDCG@3 = 5.416508275 / 7.6309297536 = 0.70980974349
    ranked = [1, 3, 0]
    dcg_val = 1.0 + 7.0 / math.log2(3)
    idcg_val = 7.0 + 1.0 / math.log2(3)
    expected_ndcg = dcg_val / idcg_val

    assert math.isclose(ndcg_at_k(ranked, k=3), expected_ndcg, rel_tol=1e-7)


def test_ndcg_edge_cases():
    # Empty list
    assert ndcg_at_k([], k=5) == 0.0
    # k <= 0
    assert ndcg_at_k([3, 2], k=0) == 0.0
    # All zero relevances (no positive signal, IDCG=0)
    assert ndcg_at_k([0, 0, 0], k=3) == 0.0
    # k > len(ranked)
    assert math.isclose(ndcg_at_k([3, 2], k=10), 1.0, rel_tol=1e-7)


def test_precision_at_k():
    # Ranked: [3, 1, 2, 0]
    # Threshold = 2 (relevance >= 2 is relevant)
    # top-2: [3, 1] -> only 3 is >= 2 -> Precision@2 = 1/2 = 0.5
    assert precision_at_k([3, 1, 2, 0], k=2, threshold=2) == 0.5

    # top-3: [3, 1, 2] -> 3 and 2 are >= 2 -> Precision@3 = 2/3
    assert math.isclose(precision_at_k([3, 1, 2, 0], k=3, threshold=2), 2.0 / 3.0, rel_tol=1e-7)

    # Empty
    assert precision_at_k([], k=5) == 0.0


def test_reciprocal_rank():
    # Relevant is >= 2
    # First relevant at rank 1 -> RR = 1.0
    assert reciprocal_rank([2, 0, 1], threshold=2) == 1.0

    # First relevant at rank 2 -> RR = 0.5
    assert reciprocal_rank([1, 3, 0], threshold=2) == 0.5

    # First relevant at rank 3 -> RR = 1/3
    assert math.isclose(reciprocal_rank([0, 1, 2], threshold=2), 1.0 / 3.0, rel_tol=1e-7)

    # None relevant -> RR = 0.0
    assert reciprocal_rank([0, 1, 1], threshold=2) == 0.0


def test_mean_reciprocal_rank():
    queries = [
        [3, 0, 1],  # RR = 1/1 = 1.0
        [1, 2, 0],  # RR = 1/2 = 0.5
        [0, 0, 0],  # RR = 0.0
    ]
    # Mean = (1.0 + 0.5 + 0.0) / 3 = 0.5
    assert math.isclose(mean_reciprocal_rank(queries, threshold=2), 0.5, rel_tol=1e-7)


def test_spearman_correlation_hand_computed():
    # Perfect positive correlation
    assert math.isclose(spearman_correlation([10, 20, 30, 40], [1, 2, 3, 4]), 1.0, rel_tol=1e-7)

    # Perfect inverse correlation
    assert math.isclose(spearman_correlation([10, 20, 30, 40], [4, 3, 2, 1]), -1.0, rel_tol=1e-7)

    # Hand-computed 3-item example:
    # Preds = [0.9, 0.5, 0.1] -> ranks [1, 2, 3] (descending)
    # Labels = [1, 3, 0] -> ranks [2, 1, 3] (descending)
    # d = [1-2, 2-1, 3-3] = [-1, 1, 0]
    # d^2 = [1, 1, 0] -> sum(d^2) = 2
    # rho = 1 - 6 * 2 / (3 * (9 - 1)) = 1 - 12 / 24 = 0.5
    assert math.isclose(spearman_correlation([0.9, 0.5, 0.1], [1, 3, 0]), 0.5, rel_tol=1e-7)

    # Hand-computed tied-ranks test:
    # Preds = [10, 10, 5] -> ranks: 10 has avg rank 1.5, 5 has rank 3.0 -> [1.5, 1.5, 3.0]
    # Labels = [3, 2, 1]  -> ranks: [1.0, 2.0, 3.0]
    # mean_p = 2.0, mean_t = 2.0
    # cov = (-0.5)*(-1.0) + (-0.5)*(0.0) + (1.0)*(1.0) = 0.5 + 0 + 1.0 = 1.5
    # var_p = 0.25 + 0.25 + 1.0 = 1.5
    # var_t = 1.0 + 0.0 + 1.0 = 2.0
    # rho = 1.5 / sqrt(1.5 * 2.0) = 1.5 / sqrt(3.0) = sqrt(3)/2 = 0.8660254037844386
    expected_tied_rho = math.sqrt(3.0) / 2.0
    assert math.isclose(spearman_correlation([10, 10, 5], [3, 2, 1]), expected_tied_rho, rel_tol=1e-7)

    # Edge cases
    assert spearman_correlation([5.0, 5.0, 5.0], [1, 2, 3]) == 0.0  # Zero variance in predictions
    assert spearman_correlation([1.0], [1]) == 0.0  # Length < 2
