export const SAMPLE_JOB_DESCRIPTION = `Senior Backend Engineer (Python / FastAPI)
We are seeking an experienced Backend Engineer to architect, build, and maintain high-throughput microservices.

Key Responsibilities:
- Design and scale distributed backend APIs using Python, FastAPI, and PostgreSQL.
- Implement robust caching with Redis and maintain CI/CD pipelines with Docker and Git.
- Collaborate with frontend engineers and data teams on RESTful API contracts.

Required Qualifications:
- 3+ years of professional backend development experience with Python.
- Proven experience with FastAPI or Django, SQL database design, and Docker containerization.
- Strong analytical and problem solving mindset; clear technical communication.`;

export const SAMPLE_RESULTS_DATA = {
  job_description_skills: [
    "python",
    "fastapi",
    "sql",
    "postgresql",
    "docker",
    "git",
    "rest api",
    "microservices",
    "problem solving",
    "communication"
  ],
  fairness_report: {
    message: "No exclusionary, gendered, or biased phrasing detected in the job requirements.",
    flagged_terms: [],
    recommendations: [
      "Job description focuses on objective technical proficiencies and role-relevant outcomes."
    ]
  },
  results: [
    {
      rank: 1,
      candidate_name: "Aarav Patel",
      file_name: "aarav_patel_senior_backend.pdf",
      final_score: 88.5,
      skill_match_score: 90.0,
      semantic_similarity_score: 85.2,
      project_relevance_score: 88.0,
      experience_relevance_score: 100.0,
      resume_skills: [
        "python",
        "fastapi",
        "sql",
        "postgresql",
        "docker",
        "git",
        "rest api",
        "microservices",
        "redis",
        "problem solving",
        "communication"
      ],
      matched_skills: [
        "python",
        "fastapi",
        "sql",
        "postgresql",
        "docker",
        "git",
        "rest api",
        "microservices",
        "problem solving"
      ],
      missing_skills: ["communication"],
      review_flag: {
        level: "Good Match",
        reason: "Candidate exceeds core experience requirements and matches 9 of 10 target JD skills."
      },
      explanation:
        "The candidate matched python, fastapi, sql, postgresql, docker, git, rest api, microservices. Missing skills: communication. Skill score is 90.0, semantic score is 85.2, project score is 88.0, experience score is 100.0, with a final score of 88.5.",
      explanation_report: {
        summary:
          "High-priority candidate with proven enterprise backend architecture in Python, FastAPI, and PostgreSQL. 4 years of hands-on production experience directly aligns with role demands.",
        candidate_summary: [
          "Strong background in Python, FastAPI, PostgreSQL, and Docker.",
          "Demonstrated microservice architecture experience handling 5,000+ req/sec.",
          "Candidate experience (4 years) exceeds the JD requirement (3 years).",
          "Recommended for expedited technical interview round."
        ],
        strengths: [
          "Matched required skills: python, fastapi, sql, postgresql, docker, git, microservices.",
          "Strong direct skill overlap (90%) with the target tech stack.",
          "Projects demonstrate enterprise-scale distributed architecture and clean API design.",
          "Exceeds minimum experience threshold with 48 months verified background."
        ],
        concerns: [
          "No explicit mention of formal written/verbal communication initiatives on resume.",
          "CI/CD tooling depth could be explored further during technical interview."
        ],
        recommendation: "Strong match. Candidate should be shortlisted immediately for round 1 screening.",
        score_breakdown: {
          skill_match: 90.0,
          semantic_similarity: 85.2,
          project_relevance: 88.0,
          experience_relevance: 100.0,
          final_score: 88.5
        },
        matched_skill_count: 9,
        missing_skill_count: 1,
        resume_skill_count: 11,
        jd_skill_count: 10
      },
      project_analysis: {
        score: 88.0,
        reason: "Projects directly demonstrate microservice design, FastAPI gateways, and relational database schema design.",
        semantic_score: 85.4,
        project_skill_score: 88.0,
        project_skills: ["python", "fastapi", "postgresql", "redis", "docker"],
        detected_project_text: "Built scalable order processing microservices using FastAPI, Redis, and PostgreSQL."
      },
      experience_analysis: {
        score: 100.0,
        required_months: 36,
        candidate_months: 48,
        reason: "Candidate experience (4 years) meets or exceeds the JD requirement (3 years)."
      }
    },
    {
      rank: 2,
      candidate_name: "Riya Mehta",
      file_name: "riya_mehta_fresher_developer.pdf",
      final_score: 72.4,
      skill_match_score: 70.0,
      semantic_similarity_score: 76.8,
      project_relevance_score: 92.0,
      experience_relevance_score: 50.0,
      resume_skills: [
        "python",
        "fastapi",
        "sql",
        "postgresql",
        "git",
        "rest api",
        "scikit-learn",
        "pandas"
      ],
      matched_skills: ["python", "fastapi", "sql", "postgresql", "git", "rest api"],
      missing_skills: ["docker", "microservices", "communication", "problem solving"],
      review_flag: {
        level: "Manual Review",
        reason: "Fresher / early-career profile with high-quality projects compensating for lower formal tenure."
      },
      explanation:
        "The candidate matched python, fastapi, sql, postgresql, git, rest api. Missing skills: docker, microservices. Project score of 92.0 significantly elevates overall match to 72.4.",
      explanation_report: {
        summary:
          "Promising fresher candidate. Exceptional project portfolio showcasing custom FastAPI REST APIs and data processing, justifying human review over automated rejection.",
        candidate_summary: [
          "Strong core foundation in Python, FastAPI, and relational SQL databases.",
          "High-impact projects demonstrating full-stack API development and model integration.",
          "Formal experience is 6 months internship vs 3 years preferred.",
          "Strong candidate for junior/associate track or fast-track interview."
        ],
        strengths: [
          "Matched required skills: python, fastapi, sql, postgresql, git, rest api.",
          "Project relevance score of 92% highlights self-directed engineering capability.",
          "Modern coding practices and clean repository organization."
        ],
        concerns: [
          "Missing Docker and container orchestration background in current portfolio.",
          "Formal industry tenure is under the 3-year guideline."
        ],
        recommendation: "Promising fresher profile. Relevant projects justify manual review or shortlisting.",
        score_breakdown: {
          skill_match: 70.0,
          semantic_similarity: 76.8,
          project_relevance: 92.0,
          experience_relevance: 50.0,
          final_score: 72.4
        },
        matched_skill_count: 6,
        missing_skill_count: 4,
        resume_skill_count: 8,
        jd_skill_count: 10
      },
      project_analysis: {
        score: 92.0,
        reason: "Projects show deep hands-on implementation with FastAPI, async endpoints, and automated tests.",
        semantic_score: 84.0,
        project_skill_score: 92.0,
        project_skills: ["python", "fastapi", "postgresql", "git"],
        detected_project_text: "Engineered distributed API gateway with automated test coverage and database caching."
      },
      experience_analysis: {
        score: 50.0,
        required_months: 36,
        candidate_months: 6,
        reason: "Candidate experience (6 months internship) is below the preferred requirement (3 years)."
      }
    },
    {
      rank: 3,
      candidate_name: "Dr. Priya Nair",
      file_name: "priya_nair_ml_engineer.pdf",
      final_score: 64.6,
      skill_match_score: 60.0,
      semantic_similarity_score: 74.0,
      project_relevance_score: 65.0,
      experience_relevance_score: 83.3,
      resume_skills: [
        "python",
        "sql",
        "git",
        "docker",
        "deep learning",
        "pytorch",
        "scikit-learn",
        "pandas"
      ],
      matched_skills: ["python", "sql", "git", "docker"],
      missing_skills: ["fastapi", "postgresql", "rest api", "microservices"],
      review_flag: {
        level: "Manual Review",
        reason: "Candidate is an ML specialist with strong general engineering, but missing core API framework."
      },
      explanation:
        "The candidate matched python, sql, git, docker. Missing skills: fastapi, postgresql, microservices. Skill match is 60.0, semantic score is 74.0, yielding 64.6.",
      explanation_report: {
        summary:
          "Experienced Machine Learning engineer with solid Python and Docker proficiency. However, background is focused on deep learning rather than enterprise API web services.",
        candidate_summary: [
          "Deep expertise in Python, algorithmic design, and Docker containerization.",
          "Extensive research and data modeling background (30 months experience).",
          "Lacks specific enterprise REST / FastAPI framework credentials."
        ],
        strengths: [
          "Matched required skills: python, sql, git, docker.",
          "High analytical and problem solving capability.",
          "Solid containerization and Git version control experience."
        ],
        concerns: [
          "Missing primary web framework requirement: FastAPI / REST API.",
          "May prefer research / ML workflows over core backend CRUD services."
        ],
        recommendation: "Moderate match. Candidate should be manually reviewed or considered for ML platform roles.",
        score_breakdown: {
          skill_match: 60.0,
          semantic_similarity: 74.0,
          project_relevance: 65.0,
          experience_relevance: 83.3,
          final_score: 64.6
        },
        matched_skill_count: 4,
        missing_skill_count: 6,
        resume_skill_count: 8,
        jd_skill_count: 10
      },
      project_analysis: {
        score: 65.0,
        reason: "Projects focus on model training and semantic search rather than microservice architectures.",
        semantic_score: 72.0,
        project_skill_score: 50.0,
        project_skills: ["python", "pytorch", "docker"],
        detected_project_text: "Built semantic transformer search pipeline with vector databases."
      },
      experience_analysis: {
        score: 83.3,
        required_months: 36,
        candidate_months: 30,
        reason: "Candidate experience (2.5 years) is close to the JD requirement (3 years)."
      }
    },
    {
      rank: 4,
      candidate_name: "Vikram Singh",
      file_name: "vikram_singh_accounting.pdf",
      final_score: 24.8,
      skill_match_score: 10.0,
      semantic_similarity_score: 28.5,
      project_relevance_score: 15.0,
      experience_relevance_score: 20.0,
      resume_skills: ["communication", "problem solving"],
      matched_skills: ["communication", "problem solving"],
      missing_skills: ["python", "fastapi", "sql", "postgresql", "docker", "git", "rest api", "microservices"],
      review_flag: {
        level: "Weak Match",
        reason: "Resume is from an unrelated field (finance/auditing) with 8 of 10 core skills absent."
      },
      explanation:
        "The candidate matched communication, problem solving. Missing technical skills: python, fastapi, sql, postgresql, docker, git, rest api. Final score is 24.8.",
      explanation_report: {
        summary:
          "Profile does not meet baseline technical requirements for a backend software engineering role.",
        candidate_summary: [
          "Background is in accounting, auditing, and financial reporting.",
          "Missing all primary programming and database requirements."
        ],
        strengths: ["Shows communication and general problem-solving attributes."],
        concerns: ["Lacks Python, API development, databases, and containerization proficiencies."],
        recommendation: "Weak match. Candidate does not possess technical prerequisites for this role.",
        score_breakdown: {
          skill_match: 10.0,
          semantic_similarity: 28.5,
          project_relevance: 15.0,
          experience_relevance: 20.0,
          final_score: 24.8
        },
        matched_skill_count: 2,
        missing_skill_count: 8,
        resume_skill_count: 2,
        jd_skill_count: 10
      },
      project_analysis: {
        score: 15.0,
        reason: "No technical software engineering projects detected on resume.",
        semantic_score: 20.0,
        project_skill_score: 0.0,
        project_skills: [],
        detected_project_text: ""
      },
      experience_analysis: {
        score: 20.0,
        required_months: 36,
        candidate_months: 0,
        reason: "No relevant software engineering experience detected."
      }
    }
  ]
};
