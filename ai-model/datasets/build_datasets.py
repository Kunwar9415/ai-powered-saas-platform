"""
Dataset generation and preparation script for Custom AI Models.
Collects and structures open-domain datasets for:
1. Text Generation (Transformer LM)
2. Document Classification & Analysis
3. Resume Domain & Skill Analysis
"""

import json
import csv
import os

DATASETS_DIR = os.path.dirname(os.path.abspath(__file__))

def create_text_corpus():
    """Generates a rich, structured text corpus for the Transformer LM."""
    corpus_path = os.path.join(DATASETS_DIR, 'text_generation_corpus.txt')
    
    sections = [
        # AI and Machine Learning Concepts
        "Artificial intelligence and deep learning are transformative disciplines within computer science. "
        "A neural network consists of layers of interconnected nodes or artificial neurons. "
        "The transformer architecture relies on multi-head self-attention mechanisms to process sequence data in parallel. "
        "Unlike recurrent neural networks, transformers do not suffer from sequential processing bottlenecks. "
        "In a causal decoder-only transformer, attention masks ensure that token predictions depend exclusively on preceding tokens. "
        "Positional encodings provide the necessary spatial information regarding token positions in the input sequence. "
        "Optimization algorithms such as Adam and AdamW adjust model weights iteratively using backpropagation of gradients.",

        # Software Engineering and Architecture
        "Software engineering encompasses systematic principles for designing, developing, testing, and maintaining software applications. "
        "A three-tier web architecture cleanly separates presentation, business logic, and persistent storage layers. "
        "The presentation tier delivers interactive user interfaces via modern frameworks like React and styling libraries like Tailwind CSS. "
        "The application layer exposes RESTful APIs using Node.js and Express to manage authentication, business rules, and state. "
        "Relational database management systems such as PostgreSQL enforce ACID guarantees for mission-critical transactional integrity. "
        "Object-Relational Mapping libraries such as Prisma simplify database queries while providing compile-time type safety. "
        "Rate limiting, JSON Web Token authentication, and input sanitization safeguard web endpoints against denial-of-service and injection attacks.",

        # Cloud and DevOps
        "Cloud computing provides on-demand availability of computing resources, storage, and networking without direct active management by the user. "
        "Continuous integration and continuous deployment pipelines automate software builds, linting, unit testing, and production deployment. "
        "Microservices architecture decomposes monolithic systems into loosely coupled, independently scalable services that communicate via HTTP or message queues. "
        "Containerization with Docker encapsulates software dependencies into standardized runtime environments. "
        "FastAPI is a modern, high-performance web framework for building APIs with Python based on standard type hints and asynchronous event loops.",

        # Full-Stack Development and JavaScript
        "JavaScript and TypeScript empower developers to write scalable front-end and backend code. "
        "React uses a virtual Document Object Model to reconcile user interface updates efficiently. "
        "Hooks such as useState, useEffect, and useContext facilitate state management and side-effect orchestration in functional components. "
        "Asynchronous JavaScript relies on promises and async await syntax to handle non-blocking I/O operations such as network requests. "
        "Vite offers rapid development server startup and lightning-fast Hot Module Replacement by serving source code over native ES modules.",

        # Algorithms and Data Structures
        "Algorithms are step-by-step computational procedures designed to solve well-defined computational problems. "
        "Time complexity and space complexity measure asymptotic algorithmic efficiency using Big O notation. "
        "Common data structures include arrays, linked lists, hash tables, binary search trees, heaps, and graphs. "
        "Dynamic programming breaks complex optimization problems into overlapping subproblems with optimal substructure. "
        "Binary search operates on sorted sequences in logarithmic time by repeatedly dividing search intervals in half.",

        # Natural Language Processing
        "Natural language processing bridges human language and machine understanding. "
        "Tokenization decomposes text into smaller linguistic units such as characters, subwords, or whole words. "
        "Vocabulary mapping assigns unique integer identifiers to tokens for tensor representations in neural networks. "
        "Cross-entropy loss measures the discrepancy between predicted probability distributions and ground truth target tokens. "
        "Autoregressive language models generate text iteratively by sampling subsequent tokens based on learned probabilities. "
        "Temperature scaling modulates sampling entropy: lower temperatures yield deterministic outputs, while higher temperatures promote creativity.",

        # Resume and Career Intelligence
        "A well-structured resume communicates candidate competencies, project achievements, and professional qualifications clearly. "
        "Applicant Tracking Systems parse resume documents into structured fields including contact details, education, technical skills, and experience. "
        "Quantifiable achievements and action verbs enhance candidate competitiveness in technical screenings. "
        "Continuous technical skill development in software design, cloud platforms, and data engineering accelerates career progression.",
    ]

    # Expand the text corpus with diverse variations and instruction pairs
    instructions = [
        "What is machine learning? Machine learning is a field of artificial intelligence where algorithms learn patterns from data to make predictions.",
        "How do transformers work? Transformers utilize self-attention mechanisms to weigh relationships between all tokens in a sequence concurrently.",
        "Explain PostgreSQL. PostgreSQL is an advanced open-source object-relational database known for reliability, extensibility, and SQL compliance.",
        "What is Node.js? Node.js is an open-source cross-platform JavaScript runtime environment executing code outside of web browsers on V8 engine.",
        "What is React? React is a declarative component-based JavaScript library developed by Meta for building dynamic user interfaces.",
        "What is FastAPI? FastAPI is a high-performance modern Python framework designed for developing RESTful APIs with automated OpenAPI documentation.",
        "How does tokenization work? Tokenization breaks continuous strings into discrete numerical tokens mapped to indices in a predefined vocabulary.",
        "Define software architecture. Software architecture establishes the fundamental structural choices and relationships comprising a software system.",
        "What is PyTorch? PyTorch is an open-source machine learning framework providing GPU acceleration and dynamic computation graphs for neural networks.",
        "How to prepare for technical interviews? Practice core data structures, system design fundamentals, algorithms, and review portfolio projects thoroughly."
    ]

    with open(corpus_path, 'w', encoding='utf-8') as f:
        for _ in range(12):  # Repeat to provide sufficient training iterations
            for sec in sections:
                f.write(sec + "\n\n")
            for inst in instructions:
                f.write(inst + "\n\n")
                
    print(f"Created text generation corpus at: {corpus_path} ({os.path.getsize(corpus_path)} bytes)")

def create_document_dataset():
    """Generates labeled samples for multi-class document classification."""
    csv_path = os.path.join(DATASETS_DIR, 'document_classification.csv')
    
    samples = [
        # Technology & Software Engineering (Label: 0)
        ("This technical specification outlines the architecture of our cloud-native microservices cluster including Kubernetes ingress, Docker containers, and PostgreSQL replication.", 0),
        ("Software design document describing REST API endpoints, JWT token authentication, Redis caching layer, and continuous integration deployment workflows.", 0),
        ("Source code documentation and API reference for the React front-end components, state management hooks, and asynchronous HTTP client services.", 0),
        ("System architecture review analyzing database connection pooling, distributed load balancing, query latency optimization, and microservice resilience.", 0),
        ("Technical report detailing backend development using Node.js, Express framework, schema migrations with Prisma ORM, and automated unit testing.", 0),
        ("Deployment guide for Docker containerization, environment variable configurations, SSL certificates, and cloud infrastructure monitoring.", 0),
        ("Codebase audit identifying refactoring opportunities in modular TypeScript libraries, memory leak prevention, and algorithmic optimization.", 0),
        ("Engineering guidelines for version control branch protection, pull request code reviews, unit test coverage metrics, and linting standards.", 0),
        
        # Academic Research & Science (Label: 1)
        ("Abstract: We propose a novel deep neural network architecture for unsupervised representation learning with empirical evaluations across standard benchmarks.", 1),
        ("In this paper, we investigate the convergence properties of stochastic gradient descent with momentum under non-convex optimization objectives.", 1),
        ("A comprehensive survey of transformer-based language models, examining attention mechanisms, computational efficiency, and empirical perplexity.", 1),
        ("Experimental methodology, statistical hypothesis testing, p-value calculations, and controlled laboratory evaluations across multiple trials.", 1),
        ("Literature review synthesizing recent advances in self-supervised learning, contrastive loss formulations, and multimodal foundation models.", 1),
        ("Mathematical formulation of positional encodings and multi-head attention projection matrices in deep sequence-to-sequence transformers.", 1),
        ("Empirical findings demonstrate statistically significant improvements in cross-entropy loss and classification accuracy over baseline methods.", 1),
        ("Dissertation investigating theoretical bounds on generalization error in overparameterized deep neural networks using uniform stability bounds.", 1),

        # Business & Product Strategy (Label: 2)
        ("Quarterly executive briefing summarizing customer retention metrics, product roadmaps, go-to-market strategies, and subscription revenue growth.", 2),
        ("Product requirement document detailing user stories, key performance indicators, customer acquisition funnels, and enterprise SaaS pricing tiers.", 2),
        ("Strategic market analysis evaluating competitive positioning, total addressable market sizing, and user onboarding conversion rates.", 2),
        ("Annual business plan forecasting recurring revenue growth, customer churn reduction initiatives, and strategic enterprise partnerships.", 2),
        ("Marketing campaign retrospective evaluating click-through rates, brand engagement scores, customer lifetime value, and lead generation.", 2),
        ("Product roadmap prioritizing feature releases for the upcoming fiscal quarter based on customer feedback and usability interviews.", 2),
        ("Stakeholder presentation covering organizational objectives, key results, cross-functional milestone tracking, and product differentiation.", 2),
        ("Business proposal for enterprise client onboarding, service level agreements, implementation timelines, and dedicated account management.", 2),

        # Finance & Economics (Label: 3)
        ("Consolidated balance sheet, cash flow statements, net operating margins, capital expenditure, and quarterly dividend distribution reports.", 3),
        ("Macroeconomic analysis of interest rate fluctuations, inflationary pressures, fiscal policy adjustments, and global currency liquidity.", 3),
        ("Investment portfolio risk assessment evaluating equity volatility, debt instruments, asset allocation strategies, and annualized returns.", 3),
        ("Financial audit report detailing compliance with international accounting standards, revenue recognition principles, and tax disclosures.", 3),
        ("Credit risk modeling report quantifying probability of default, loss given default, and capital adequacy ratio across corporate loan portfolios.", 3),
        ("Venture capital investment memorandum assessing valuation multiples, revenue run rates, burn rates, and projected cash runway.", 3),
        ("Treasury management overview analyzing liquidity reserves, foreign exchange hedging strategies, and short-term commercial paper yields.", 3),
        ("Earnings release presentation highlighting GAAP net income, diluted earnings per share, EBITDA margins, and operating cash flow metrics.", 3),

        # Legal, Compliance & Policy (Label: 4)
        ("This Master Services Agreement governs the terms and conditions under which the software platform licenses proprietary services to the client.", 4),
        ("Privacy policy detailing user data collection procedures, cookie usage, data retention periods, and compliance with GDPR regulations.", 4),
        ("Terms of Service agreement specifying intellectual property rights, indemnification clauses, limitation of liability, and dispute arbitration.", 4),
        ("Corporate governance bylaws defining the duties and fiduciary responsibilities of the Board of Directors, shareholder voting rights, and audit policies.", 4),
        ("Non-disclosure and confidentiality agreement protecting proprietary algorithms, source code, trade secrets, and non-public business strategies.", 4),
        ("Regulatory compliance audit reviewing information security safeguards, SOC 2 compliance certifications, and statutory data handling standards.", 4),
        ("Software licensing agreement defining permitted commercial usage, redistribution restrictions, third-party library attributions, and patent grants.", 4),
        ("Vendor contract amendment detailing termination provisions, force majeure clauses, governing law jurisdictions, and notice requirements.", 4),

        # Medical & Healthcare Sciences (Label: 5)
        ("Clinical trial protocol evaluating drug efficacy, dosage safety profiles, patient demographic inclusion criteria, and adverse event reporting.", 5),
        ("Patient case study analyzing diagnostic imaging modalities, laboratory test results, pharmacotherapy interventions, and recovery prognosis.", 5),
        ("Epidemiological study investigating transmission dynamics, population-level vaccine efficacy, and incidence rates across demographic cohorts.", 5),
        ("Biomedical research article investigating cellular signaling pathways, genetic expression markers, and metabolic enzyme regulation.", 5),
        ("Healthcare quality assessment reviewing clinical patient safety protocols, surgical infection control rates, and hospital readmissions.", 5),
        ("Pharmacological evaluation of active drug compounds, bioavailability measurements, renal clearance rates, and therapeutic index.", 5),
        ("Public health policy recommendations regarding preventive screening initiatives, disease surveillance systems, and community health centers.", 5),
        ("Medical research manuscript evaluating clinical outcomes of minimally invasive surgical procedures compared with traditional techniques.", 5),
    ]

    # Multiply dataset samples with slight syntactic diversity for robust training
    expanded_samples = []
    prefixes = [
        "",
        "Overview: ",
        "Executive Summary: ",
        "Document Briefing: ",
        "Official Report: "
    ]
    for prefix in prefixes:
        for text, label in samples:
            expanded_samples.append((prefix + text, label))

    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['text', 'label'])
        for text, label in expanded_samples:
            writer.writerow([text, label])
            
    print(f"Created document classification dataset at: {csv_path} ({len(expanded_samples)} samples)")

def create_resume_dataset():
    """Generates labeled resumes and structured skills taxonomy."""
    json_path = os.path.join(DATASETS_DIR, 'resume_skills_dataset.json')
    
    dataset = {
        "categories": [
            "Full-Stack Web Development",
            "Machine Learning & Data Science",
            "Cloud Engineering & DevOps",
            "Cybersecurity & Infrastructure",
            "Mobile App Development",
            "Product & Engineering Management"
        ],
        "taxonomy": {
            "languages": ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "SQL", "HTML", "CSS", "Bash", "R"],
            "frontend": ["React", "Vue", "Angular", "Next.js", "Tailwind CSS", "Bootstrap", "Redux", "Webpack", "Vite", "HTML5", "CSS3"],
            "backend": ["Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "ASP.NET", "GraphQL", "REST APIs", "gRPC"],
            "databases": ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite", "Cassandra", "DynamoDB", "Elasticsearch", "Prisma"],
            "cloud_devops": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Nginx", "GitHub Actions"],
            "ai_ml": ["PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "NLP", "Computer Vision", "Transformers", "Keras", "OpenCV"],
            "soft_skills": ["Leadership", "Agile", "Scrum", "Communication", "Problem Solving", "Collaboration", "Critical Thinking", "Mentorship"]
        },
        "role_benchmarks": {
            "Full-Stack Developer": ["React", "Node.js", "JavaScript", "TypeScript", "PostgreSQL", "REST APIs", "Tailwind CSS", "Git", "Docker"],
            "Machine Learning Engineer": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "NumPy", "Pandas", "Deep Learning", "NLP", "SQL"],
            "DevOps / Cloud Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Bash", "Python", "Monitoring"],
            "Backend Engineer": ["Node.js", "Python", "PostgreSQL", "Redis", "REST APIs", "Docker", "SQL", "Microservices", "Git"],
            "Frontend Engineer": ["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML5", "CSS3", "Vite", "Redux", "Git"],
            "Data Scientist": ["Python", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Machine Learning", "Statistics", "Data Visualization", "R"]
        },
        "samples": [
            {
                "domain": "Full-Stack Web Development",
                "label": 0,
                "text": "Full-Stack Software Engineer with 3+ years experience building web applications using React, Node.js, Express, TypeScript, and PostgreSQL. Experienced in REST API design, Prisma ORM, Tailwind CSS, Docker, and GitHub Actions CI/CD workflows."
            },
            {
                "domain": "Machine Learning & Data Science",
                "label": 1,
                "text": "Data Scientist and Machine Learning Researcher specializing in PyTorch, Scikit-Learn, Pandas, and NLP. Implemented Transformer architectures, deep neural networks, predictive modeling, statistical hypothesis testing, and model evaluation pipelines."
            },
            {
                "domain": "Cloud Engineering & DevOps",
                "label": 2,
                "text": "Senior Cloud and DevOps Engineer with deep expertise in AWS, Kubernetes, Docker, Terraform, and Linux administration. Designed highly available infrastructure, continuous integration deployment pipelines, and automated observability monitoring."
            },
            {
                "domain": "Cybersecurity & Infrastructure",
                "label": 3,
                "text": "Cybersecurity Analyst and Systems Administrator skilled in network defense, vulnerability assessments, penetration testing, SIEM log analysis, firewall configuration, identity access management, and ISO 27001 regulatory compliance."
            },
            {
                "domain": "Mobile App Development",
                "label": 4,
                "text": "Mobile Application Developer with 4 years expertise developing cross-platform and native mobile apps using React Native, Flutter, Swift, Kotlin, and SQLite. Published multi-tier applications to Google Play and Apple App Store."
            },
            {
                "domain": "Product & Engineering Management",
                "label": 5,
                "text": "Engineering Manager and Technical Product Lead directing Agile scrum teams, sprint planning, cross-functional stakeholder roadmaps, customer discovery, system architecture reviews, and high-impact SaaS product delivery."
            }
        ]
    }
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2)
        
    print(f"Created resume skills dataset at: {json_path}")

if __name__ == '__main__':
    create_text_corpus()
    create_document_dataset()
    create_resume_dataset()
    print("All datasets generated successfully!")

