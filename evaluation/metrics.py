import math
from typing import Sequence, List, Dict, Tuple


def dcg_at_k(relevances: Sequence[float | int], k: int) -> float:
    """
    Computes Discounted Cumulative Gain at rank k using standard graded formula:
    DCG@k = sum_{i=1}^k (2^{rel_i} - 1) / log2(i + 1)
    """
    if k <= 0:
        return 0.0
    dcg = 0.0
    for i, rel in enumerate(relevances[:k], start=1):
        rel_val = float(rel)
        dcg += (math.pow(2.0, rel_val) - 1.0) / math.log2(i + 1)
    return dcg


def idcg_at_k(all_relevances: Sequence[float | int], k: int) -> float:
    """
    Computes Ideal DCG at rank k by sorting all available relevances descending.
    """
    if k <= 0 or not all_relevances:
        return 0.0
    sorted_rels = sorted(all_relevances, reverse=True)
    return dcg_at_k(sorted_rels, k)


def ndcg_at_k(
    ranked_relevances: Sequence[float | int],
    all_relevances: Sequence[float | int] | None = None,
    k: int = 5,
) -> float:
    """
    Computes Normalized Discounted Cumulative Gain at rank k.
    If all_relevances is None, uses ranked_relevances as the full set.
    If IDCG is 0.0 (all items irrelevant), returns 0.0.
    """
    if k <= 0 or not ranked_relevances:
        return 0.0

    pool = all_relevances if all_relevances is not None else ranked_relevances
    ideal_dcg = idcg_at_k(pool, k)
    if ideal_dcg <= 0.0:
        return 0.0

    actual_dcg = dcg_at_k(ranked_relevances, k)
    return min(1.0, actual_dcg / ideal_dcg)


def precision_at_k(
    ranked_relevances: Sequence[float | int],
    k: int = 5,
    threshold: float | int = 2,
) -> float:
    """
    Computes Precision@k as fraction of top-k retrieved items with relevance >= threshold.
    Relevance is on a 0-3 scale: standard threshold is 2 (relevant/highly relevant).
    """
    if k <= 0 or not ranked_relevances:
        return 0.0
    top_k = ranked_relevances[:k]
    if not top_k:
        return 0.0
    relevant_count = sum(1 for r in top_k if r >= threshold)
    return relevant_count / len(top_k)


def reciprocal_rank(
    ranked_relevances: Sequence[float | int],
    threshold: float | int = 2,
) -> float:
    """
    Computes Reciprocal Rank (RR): 1 / rank of the first item with relevance >= threshold.
    Returns 0.0 if no item meets the threshold.
    """
    for rank, rel in enumerate(ranked_relevances, start=1):
        if rel >= threshold:
            return 1.0 / rank
    return 0.0


def mean_reciprocal_rank(
    list_of_ranked_relevances: Sequence[Sequence[float | int]],
    threshold: float | int = 2,
) -> float:
    """
    Computes Mean Reciprocal Rank (MRR) across multiple queries.
    """
    if not list_of_ranked_relevances:
        return 0.0
    rrs = [reciprocal_rank(rels, threshold=threshold) for rels in list_of_ranked_relevances]
    return sum(rrs) / len(rrs)


def _compute_ranks(values: Sequence[float]) -> List[float]:
    """
    Computes fractional ranks for a sequence of values (handling ties via average rank).
    Higher values get lower rank numbers (i.e. rank 1 is highest value), matching standard sorting.
    """
    n = len(values)
    indexed = sorted(enumerate(values), key=lambda x: x[1], reverse=True)
    ranks = [0.0] * n

    i = 0
    while i < n:
        j = i
        while j < n and indexed[j][1] == indexed[i][1]:
            j += 1
        # Average rank for tie group (1-indexed)
        avg_rank = (i + 1 + j) / 2.0
        for k in range(i, j):
            ranks[indexed[k][0]] = avg_rank
        i = j

    return ranks


def spearman_correlation(
    predicted_scores: Sequence[float],
    true_relevances: Sequence[float | int],
) -> float:
    """
    Computes Spearman's rank correlation coefficient (rho) between predictions and labels.
    Handles tied ranks properly. Returns 0.0 if variance of either sequence is zero.
    """
    n = len(predicted_scores)
    if n < 2 or len(true_relevances) != n:
        return 0.0

    # Quick check if all values are identical
    if all(p == predicted_scores[0] for p in predicted_scores):
        return 0.0
    if all(t == true_relevances[0] for t in true_relevances):
        return 0.0

    rank_p = _compute_ranks([float(p) for p in predicted_scores])
    rank_t = _compute_ranks([float(t) for t in true_relevances])

    mean_p = sum(rank_p) / n
    mean_t = sum(rank_t) / n

    cov = sum((rank_p[i] - mean_p) * (rank_t[i] - mean_t) for i in range(n))
    var_p = sum((rank_p[i] - mean_p) ** 2 for i in range(n))
    var_t = sum((rank_t[i] - mean_t) ** 2 for i in range(n))

    denom = math.sqrt(var_p * var_t)
    if denom <= 0.0:
        return 0.0

    return max(-1.0, min(1.0, cov / denom))
