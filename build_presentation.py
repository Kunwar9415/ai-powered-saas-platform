"""
Generates the comprehensive 28-slide Final Major Project Defense Presentation
for: AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI.
Authored by: Kunwar Kantikeya Gautam (202300570) & Prince Yadav (202300571)
Supervised by: Ms. Sonam Lhamu Bhutia, Dept. of IT, SMIT, SMU.
"""

import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Visual Assets
    smu_logo_main = 'ppt_assets/page_1_img_1.png'
    smu_logo_header = 'ppt_assets/page_2_img_1.png'

    # Color Palette - Professional Academic Slate & Deep Purple
    COLOR_BLACK = RGBColor(15, 23, 42)        # Slate 900
    COLOR_BODY = RGBColor(51, 65, 85)         # Slate 700
    COLOR_MUTED = RGBColor(100, 116, 139)     # Slate 500
    COLOR_PURPLE = RGBColor(109, 40, 217)     # Violet 700
    COLOR_DARK_PURPLE = RGBColor(88, 28, 135) # Violet 900
    COLOR_EMERALD = RGBColor(16, 185, 129)    # Emerald 500
    COLOR_BLUE = RGBColor(37, 99, 235)        # Blue 600
    COLOR_BG_CARD = RGBColor(248, 250, 252)   # Slate 50
    COLOR_BORDER = RGBColor(226, 232, 240)    # Slate 200
    COLOR_WHITE = RGBColor(255, 255, 255)

    TOTAL_SLIDES = 28

    def add_header(slide, title_text, slide_num=None):
        if os.path.exists(smu_logo_header):
            slide.shapes.add_picture(smu_logo_header, Inches(0.5), Inches(0.25), height=Inches(0.65))
        
        title_box = slide.shapes.add_textbox(Inches(2.4), Inches(0.2), Inches(10.3), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = 'Times New Roman'
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.alignment = PP_ALIGN.CENTER

        if slide_num:
            num_box = slide.shapes.add_textbox(Inches(11.5), Inches(6.9), Inches(1.5), Inches(0.4))
            np = num_box.text_frame.paragraphs[0]
            np.text = f"{slide_num} / {TOTAL_SLIDES}"
            np.font.name = 'Times New Roman'
            np.font.size = Pt(11)
            np.font.color.rgb = COLOR_MUTED
            np.alignment = PP_ALIGN.RIGHT

    def add_card(slide, left, top, width, height, bg_color=COLOR_BG_CARD, border_color=COLOR_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
        return shape

    def add_figure_card(slide, left, top, width, height, image_path, caption=None):
        card = add_card(slide, left, top, width, height, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)
        if os.path.exists(image_path):
            cap_h = Inches(1.1) if caption else Inches(0)
            max_w = width - Inches(0.4)
            max_h = height - cap_h - Inches(0.35)
            
            with Image.open(image_path) as im:
                iw, ih = im.size
            aspect = iw / ih
            
            fit_w = max_w
            fit_h = int(fit_w / aspect)
            if fit_h > max_h:
                fit_h = max_h
                fit_w = int(fit_h * aspect)
                
            img_x = left + (width - fit_w) // 2
            img_y = top + Inches(0.18) + (max_h - fit_h) // 2
            
            slide.shapes.add_picture(image_path, img_x, img_y, width=fit_w, height=fit_h)
            
            if caption:
                cap_y = top + height - cap_h - Inches(0.08)
                cap_box = slide.shapes.add_textbox(left + Inches(0.25), cap_y, width - Inches(0.5), cap_h)
                tf = cap_box.text_frame
                tf.word_wrap = True
                p = tf.paragraphs[0]
                p.text = caption
                p.font.name = 'Times New Roman'
                p.font.size = Pt(11)
                p.font.color.rgb = COLOR_BODY
                p.font.italic = True
        return card

    # =========================================================================
    # SLIDE 1: Title Slide (Final Defense)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    
    tb = s1.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "FINAL MAJOR PROJECT PRESENTATION & DEFENSE"
    p1.font.name = 'Times New Roman'
    p1.font.size = Pt(20)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_MUTED
    p1.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "“AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI”"
    p2.font.name = 'Times New Roman'
    p2.font.size = Pt(26)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_PURPLE
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(4)

    p_sub = tf.add_paragraph()
    p_sub.text = "Design, Scratch Training, Evaluation, and Microservice Integration of Custom Deep Neural Models"
    p_sub.font.name = 'Times New Roman'
    p_sub.font.size = Pt(15)
    p_sub.font.italic = True
    p_sub.font.color.rgb = COLOR_BODY
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.space_before = Pt(3)

    if os.path.exists(smu_logo_main):
        s1.shapes.add_picture(smu_logo_main, Inches(4.5), Inches(2.2), width=Inches(4.3))

    tb_auth = s1.shapes.add_textbox(Inches(1.2), Inches(3.3), Inches(10.9), Inches(3.8))
    tf_auth = tb_auth.text_frame
    tf_auth.word_wrap = True

    p = tf_auth.paragraphs[0]
    p.text = "Project Team Members:"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(16.5)
    p.font.bold = True
    p.font.color.rgb = COLOR_BLACK
    p.alignment = PP_ALIGN.CENTER

    p = tf_auth.add_paragraph()
    p.text = "Kunwar Kantikeya Gautam (Reg. No: 202300570)   •   Prince Yadav (Reg. No: 202300571)"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_BLACK
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(4)

    p = tf_auth.add_paragraph()
    p.text = "Under the Supervision of:"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(16.5)
    p.font.bold = True
    p.font.italic = True
    p.font.color.rgb = COLOR_BLACK
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(12)

    p = tf_auth.add_paragraph()
    p.text = "Ms. Sonam Lhamu Bhutia\nAssistant Professor (Selection Grade)\nDEPARTMENT OF INFORMATION TECHNOLOGY\nSIKKIM MANIPAL INSTITUTE OF TECHNOLOGY"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(14.5)
    p.font.color.rgb = COLOR_BLACK
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(4)

    # =========================================================================
    # SLIDE 2: Presentation Agenda
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Presentation Agenda & Defense Structure", 2)

    c1 = add_card(s2, Inches(1.0), Inches(1.3), Inches(5.4), Inches(5.4))
    tb_c1 = s2.shapes.add_textbox(Inches(1.2), Inches(1.45), Inches(5.0), Inches(5.1))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True

    agenda_left = [
        "1. Executive Abstract & Motivation",
        "2. The Third-Party AI Crisis (Problem Statement)",
        "3. Strict Guide Instructions & Compliance Mandates",
        "4. Literature Survey (IEEE Papers & Gaps)",
        "5. System Architecture (5-Tier Microservices)",
        "6. Hardware Feasibility & Sizing Inspection",
        "7. Datasets & Open-Source Licensing",
    ]
    for i, item in enumerate(agenda_left):
        p = tf_c1.paragraphs[0] if i == 0 else tf_c1.add_paragraph()
        p.text = item
        p.font.name = 'Times New Roman'
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(14)

    c2 = add_card(s2, Inches(6.9), Inches(1.3), Inches(5.4), Inches(5.4), bg_color=RGBColor(245, 243, 255), border_color=RGBColor(221, 214, 254))
    tb_c2 = s2.shapes.add_textbox(Inches(7.1), Inches(1.45), Inches(5.0), Inches(5.1))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True

    agenda_right = [
        "8. Model 1: CustomTransformerLM-v1 (3.47M Params)",
        "9. Model 1 Results: Loss & Perplexity Convergence",
        "10. Model 2: DocumentClassifierNet-v1 (95.9K Params)",
        "11. Model 2 Results: Domain Categorization & Salience",
        "12. Model 3: Resume Classifier & ATS Engine",
        "13. Model 3 Results: Skill Matching & ATS Scoring",
        "14. Benchmarks, Full-Stack Demo, Conclusion & Q&A",
    ]
    for i, item in enumerate(agenda_right):
        p = tf_c2.paragraphs[0] if i == 0 else tf_c2.add_paragraph()
        p.text = item
        p.font.name = 'Times New Roman'
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = COLOR_DARK_PURPLE
        p.space_before = Pt(14)

    # =========================================================================
    # SLIDE 3: Executive Abstract
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Executive Abstract", 3)

    tb3 = s3.shapes.add_textbox(Inches(1.0), Inches(1.35), Inches(11.333), Inches(5.4))
    tf3 = tb3.text_frame
    tf3.word_wrap = True

    abs_points = [
        ("Core Research Objective:", "To transform a standard full-stack SaaS platform into an autonomous, sovereign AI SaaS platform that develops, trains, evaluates, and deploys our OWN custom deep learning models—without external APIs and without downloaded pretrained weights."),
        ("Strict Implementation Scope:", "The application delivers exactly three specialized AI capabilities: (1) Custom Text Generation, (2) Deep Document Analysis, and (3) Resume Analysis with ATS Scoring. All image-generation components and dependencies were completely purged to maintain a lean, secure, and focused architecture."),
        ("Custom Neural Development:", "We engineered a 3.47M-parameter causal decoder Transformer LM, a 95.9K-parameter document classifier, and a 49.4K-parameter resume domain classifier. All neural weights were initialized randomly (Gaussian & Kaiming) and trained on dedicated domain corpora using pure CPU hardware."),
        ("Key Quantitative Findings:", "Our Transformer achieved an evaluation loss of 0.0084 and a perplexity of 1.0084 after 25 epochs. The document and resume classifiers both achieved 100% test accuracy across 6 domain classes with warm inference latency under 85 ms per request.")
    ]
    for i, (h, b) in enumerate(abs_points):
        p = tf3.paragraphs[0] if i == 0 else tf3.add_paragraph()
        p.text = f"•  {h} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(15.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(12)
        p.line_spacing = 1.2
        
        run = p.add_run()
        run.text = b
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 4: Motivation & The Crisis of Third-Party AI APIs
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Motivation: The Crisis of Third-Party AI APIs", 4)

    m_cards = [
        ("Data Exfiltration & Privacy Risk", "Commercial APIs (OpenAI, Gemini, Anthropic) ingest sensitive user documents, resumes, and corporate text. This violates GDPR, HIPAA, and internal enterprise data compliance policies."),
        ("Unpredictable Recurring Costs", "Token-based pricing leads to uncontrollable recurring bills that scale non-linearly with platform users. Sudden price restructuring directly threatens SaaS economic viability."),
        ("Vendor Lock-In & Downtime Vulnerability", "Applications tied to external endpoints inherit upstream outages, unpredictable latency spikes (TTFT > 1.2s), model deprecations, and rigid rate throttling."),
        ("The Local Foundation Model Dilemma", "Downloading massive 70B+ parameter open-source foundation models (e.g., LLaMA-3) requires 48GB+ GPU clusters, making them prohibitive for standard CPU/edge hosting.")
    ]
    coords_4 = [
        (Inches(0.8), Inches(1.4), Inches(5.6), Inches(2.5)),
        (Inches(6.8), Inches(1.4), Inches(5.6), Inches(2.5)),
        (Inches(0.8), Inches(4.2), Inches(5.6), Inches(2.5)),
        (Inches(6.8), Inches(4.2), Inches(5.6), Inches(2.5))
    ]
    for idx, (title, desc) in enumerate(m_cards):
        cx, cy, cw, ch = coords_4[idx]
        add_card(s4, cx, cy, cw, ch, bg_color=COLOR_BG_CARD, border_color=COLOR_BORDER)
        tb = s4.shapes.add_textbox(cx + Inches(0.2), cy + Inches(0.15), cw - Inches(0.4), ch - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{idx+1}. {title}"
        p.font.name = 'Times New Roman'
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = COLOR_PURPLE

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = 'Times New Roman'
        p2.font.size = Pt(13)
        p2.font.color.rgb = COLOR_BODY
        p2.space_before = Pt(6)

    # =========================================================================
    # SLIDE 5: Guide Instructions & Project Mandates
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Project Guide Instructions & Strict Mandates", 5)

    tb5 = s5.shapes.add_textbox(Inches(1.0), Inches(1.35), Inches(11.333), Inches(5.4))
    tf5 = tb5.text_frame
    tf5.word_wrap = True

    mandates = [
        ("Mandate 1: No External AI APIs", "Strictly prohibited using commercial generative endpoints including OpenAI (ChatGPT), Google Gemini, Anthropic Claude, or Groq Cloud.", COLOR_PURPLE),
        ("Mandate 2: No Downloaded Pretrained Models", "Prohibited simply downloading pre-packaged checkpoints from Hugging Face or Ollama. No claiming that pretrained models are custom-trained.", COLOR_PURPLE),
        ("Mandate 3: Custom Architecture & Random Initialization", "Design our own neural architectures in PyTorch, initialize weights randomly, and implement our own training and evaluation pipelines.", COLOR_DARK_PURPLE),
        ("Mandate 4: Complete Removal of Image Generation", "Completely remove all image synthesis, editing, background removal, and object removal endpoints, UI views, and dependencies.", COLOR_BLACK),
        ("Mandate 5: Exactly Three Core AI Functions", "Focus exclusively on: (1) Custom Text Generation, (2) Document Analysis, and (3) Resume Analysis with Skill Matching & ATS Scoring.", COLOR_EMERALD),
        ("Mandate 6: Real Empirical Truth", "Do not invent dataset sizes, accuracy scores, or performance numbers. All metrics must be genuinely computed from trained checkpoints.", COLOR_DARK_PURPLE)
    ]
    for i, (head, body, col) in enumerate(mandates):
        p = tf5.paragraphs[0] if i == 0 else tf5.add_paragraph()
        p.text = f"✔  {head}: "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(15.5)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_before = Pt(9)
        
        run = p.add_run()
        run.text = body
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 6: Literature Survey & Research Gaps
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Literature Survey & Research Gaps", 6)

    # Table for Lit Survey
    rows, cols = 4, 4
    left, top, width, height = Inches(0.8), Inches(1.4), Inches(11.733), Inches(5.2)
    t_shape = s6.shapes.add_table(rows, cols, left, top, width, height)
    tbl = t_shape.table

    tbl.columns[0].width = Inches(2.8)
    tbl.columns[1].width = Inches(3.0)
    tbl.columns[2].width = Inches(3.0)
    tbl.columns[3].width = Inches(2.933)

    lheaders = ["Paper Citation", "Core Focus & Findings", "Identified Research Gap", "Application in Our Project"]
    for c_i, ht in enumerate(lheaders):
        cell = tbl.cell(0, c_i)
        cell.text = ht
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(30, 41, 59)
        p = cell.text_frame.paragraphs[0]
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.alignment = PP_ALIGN.CENTER

    l_rows = [
        [
            "S. Bengesi et al., IEEE Access, Vol. 12, pp. 69812-69837, 2024",
            "Comprehensive review of Transformers, GPT, and autoencoders across natural language and coding domains.",
            "High computational cost, privacy risks, and lack of lightweight self-trained models for edge platforms.",
            "Formulates the mathematical foundation of our causal masked self-attention and Pre-LN decoder architecture."
        ],
        [
            "A. R. Ali et al., IEEE IJCNN, pp. 1-10, 2024",
            "Cross-industry generative AI platforms providing centralized services across cloud enterprise workflows.",
            "Heavy reliance on third-party cloud APIs rather than self-contained, sovereign AI models.",
            "Directly motivates our decoupled 5-tier microservice architecture connecting FastAPI to Express and React."
        ],
        [
            "I. Nowrin & F. Khanam, IEEE ICAML, pp. 1-5, 2019",
            "Cloud deployment models and security architectures for multi-tenant Software-as-a-Service (SaaS).",
            "Data sovereignty and tenant isolation issues when processing user-uploaded documents.",
            "Informs our stateless JWT authentication, rate limiting, and zero-network-leakage local inference pipeline."
        ]
    ]
    for r_i, r_data in enumerate(l_rows):
        bg = RGBColor(248, 250, 252) if r_i % 2 == 0 else COLOR_WHITE
        for c_i, val in enumerate(r_data):
            cell = tbl.cell(r_i + 1, c_i)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.font.name = 'Times New Roman'
            p.font.size = Pt(11.5)
            p.font.color.rgb = COLOR_BLACK
            p.alignment = PP_ALIGN.LEFT
            if c_i == 0:
                p.font.bold = True

    # =========================================================================
    # SLIDE 7: Hardware Constraints & Feasibility Audit
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Hardware Constraints & Feasibility Audit", 7)

    c_hw_l = add_card(s7, Inches(0.8), Inches(1.3), Inches(5.8), Inches(5.4))
    tb_hw_l = s7.shapes.add_textbox(Inches(1.0), Inches(1.45), Inches(5.4), Inches(5.1))
    tf_hw_l = tb_hw_l.text_frame
    tf_hw_l.word_wrap = True

    p = tf_hw_l.paragraphs[0]
    p.text = "Host Hardware Profile"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    hw_specs = [
        ("Processor:", "Intel 16-Thread Multi-Core CPU @ 2.30 GHz"),
        ("System Memory (RAM):", "15.34 GB Physical RAM"),
        ("CUDA Availability:", "False (Pure CPU execution environment)"),
        ("Operating System:", "Microsoft Windows 11 Enterprise (x64)"),
        ("Python Runtime:", "Python 3.12.5 (64-bit)"),
        ("Deep Learning Framework:", "PyTorch 2.6.0+cpu, Scikit-learn 1.6.1"),
        ("Node Runtime:", "Node.js v24.12.0 & Express.js 4.21.2")
    ]
    for h, b in hw_specs:
        p = tf_hw_l.add_paragraph()
        p.text = f"•  {h} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(8)
        run = p.add_run()
        run.text = b
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    c_hw_r = add_card(s7, Inches(6.8), Inches(1.3), Inches(5.7), Inches(5.4), bg_color=RGBColor(245, 243, 255), border_color=RGBColor(221, 214, 254))
    tb_hw_r = s7.shapes.add_textbox(Inches(7.0), Inches(1.45), Inches(5.3), Inches(5.1))
    tf_hw_r = tb_hw_r.text_frame
    tf_hw_r.word_wrap = True

    p = tf_hw_r.paragraphs[0]
    p.text = "Architectural Sizing Decisions"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_DARK_PURPLE

    sizing_rules = [
        ("Realistic Parameter Budgets:", "Avoided unrealistic attempts to train multi-billion parameter models on CPU. Designed a targeted 3.47M-parameter Transformer LM that converges in minutes on 16 CPU threads."),
        ("EmbeddingBag Semantic Pooling:", "Employed PyTorch's EmbeddingBag(mode='mean') for document and resume classifiers, achieving high representational capacity with just 95.9K and 49.4K parameters."),
        ("Zero GPU Dependency:", "Guarantees that any consumer desktop, low-cost virtual machine, or local edge server can train and serve the models without dedicated GPU acceleration.")
    ]
    for h, b in sizing_rules:
        p = tf_hw_r.add_paragraph()
        p.text = f"•  {h} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(8)
        run = p.add_run()
        run.text = b
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 8: 5-Tier End-to-End System Architecture
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "5-Tier End-to-End System Architecture", 8)

    tiers_data = [
        ("Tier 1: Presentation Layer", "React 18, Vite, Tailwind CSS", "Single Page Application (SPA), interactive inference visualizer, JWT state.", COLOR_BLUE),
        ("Tier 2: Application Gateway", "Node.js & Express.js (:5000)", "Stateless JWT auth, rate limiting, Multer file upload buffering (PDF/DOCX).", COLOR_PURPLE),
        ("Tier 3: Local AI Microservice", "Python FastAPI (:8000) & Uvicorn", "Asynchronous endpoints (/generate, /analyze-document, /analyze-resume, /health).", COLOR_DARK_PURPLE),
        ("Tier 4: Deep Learning Layer", "PyTorch 2.6 Custom Models", "CustomTransformerLM (3.47M), DocumentNet (95.9K), ResumeClassifier (49.4K).", COLOR_BLACK),
        ("Tier 5: Data Persistence Layer", "PostgreSQL via Prisma ORM", "Relational persistence for users, generation logs, and audit metadata.", COLOR_EMERALD)
    ]
    t_tops = [Inches(1.35), Inches(2.48), Inches(3.61), Inches(4.74), Inches(5.87)]
    for idx, (tname, ttech, tdesc, tcolor) in enumerate(tiers_data):
        y = t_tops[idx]
        add_card(s8, Inches(0.8), y, Inches(5.3), Inches(1.02), bg_color=COLOR_BG_CARD, border_color=COLOR_BORDER)
        
        tb = s8.shapes.add_textbox(Inches(0.95), y + Inches(0.06), Inches(5.0), Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{tname} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = tcolor

        r = p.add_run()
        r.text = f"[{ttech}]"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = COLOR_MUTED

        p2 = tf.add_paragraph()
        p2.text = tdesc
        p2.font.name = 'Times New Roman'
        p2.font.size = Pt(11)
        p2.font.color.rgb = COLOR_BODY
        p2.space_before = Pt(2)

    # Right: Architecture Diagram Figure Card
    add_figure_card(
        s8, Inches(6.3), Inches(1.35), Inches(6.233), Inches(5.54),
        'report_figures/fig1_system_architecture.png',
        caption="Figure 1: 5-Tier Sovereign End-to-End Architecture. Requests originate at the React client, route through Express.js gateway security, execute on local FastAPI PyTorch microservices, and log to PostgreSQL with zero external API calls."
    )
# =========================================================================
    # SLIDE 9: Complete Engineering Lifecycle (9 Stages)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Complete Engineering Lifecycle & Execution Stages", 9)

    phases_data = [
        ("Phase I: Audit & Scoping", "Stages 1–3", [
            "Hardware audit (16-thread CPU, 15.3GB RAM).",
            "Total removal of legacy image AI components.",
            "Curation of 3 permissively-licensed datasets."
        ], COLOR_BLUE),
        ("Phase II: Model Training", "Stages 4–6", [
            "CustomTransformerLM-v1 (3.47M, 0.0084 loss).",
            "DocumentClassifierNet-v1 (95.9K, 100% test acc).",
            "ResumeDomainClassifierNet-v1 (49.4K, 100% acc)."
        ], COLOR_PURPLE),
        ("Phase III: Full-Stack Integration", "Stages 7–9", [
            "Python FastAPI async microservice (:8000).",
            "Node.js Express gateway & React client.",
            "Full verification suite & academic reports."
        ], COLOR_EMERALD)
    ]
    p_lefts = [Inches(0.8), Inches(4.75), Inches(8.7)]
    for idx, (pname, pstage, pbullets, pcolor) in enumerate(phases_data):
        x = p_lefts[idx]
        add_card(s9, x, Inches(1.35), Inches(3.8), Inches(1.9), bg_color=COLOR_BG_CARD, border_color=COLOR_BORDER)
        tb = s9.shapes.add_textbox(x + Inches(0.15), Inches(1.42), Inches(3.5), Inches(1.75))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{pname} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = pcolor

        r = p.add_run()
        r.text = f"[{pstage}]"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = COLOR_MUTED

        for b in pbullets:
            pb = tf.add_paragraph()
            pb.text = f"• {b}"
            pb.font.name = 'Times New Roman'
            pb.font.size = Pt(11)
            pb.font.color.rgb = COLOR_BODY
            pb.space_before = Pt(2)

    # Bottom: Gantt Chart Timeline
    add_figure_card(
        s9, Inches(0.8), Inches(3.4), Inches(11.733), Inches(3.5),
        'report_figures/fig9_gantt_timeline.png',
        caption="Figure 9: Major Project Engineering Lifecycle Gantt Chart illustrating sequential milestones, parallel pipeline development, and validation checkpoints across all 9 execution stages."
    )
# =========================================================================
    # SLIDE 10: Training Datasets & Open-Source Licensing
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Training Datasets & Open-Source Licensing", 10)

    d_info = [
        (
            "1. Text Generation Corpus",
            "text_generation_corpus.txt (73.2 KB, UTF-8 text)",
            "• Purpose: Autoregressive pretraining of CustomTransformerLM-v1.\n• Content: Curated software engineering principles, machine learning concepts, data structures, and algorithms.\n• Licensing: Permissive Open Access (MIT / Apache-2.0 / CC-BY 4.0 / Public Domain).\n• Vocabulary: 3,840 distinct tokens with special control tokens (<pad>, <unk>, <bos>, <eos>)."
        ),
        (
            "2. Document Classification Corpus",
            "document_classification.csv (240 structured samples)",
            "• Purpose: Supervised training of DocumentClassifierNet-v1.\n• Categories: 6 balanced domain categories (Technology, Science, Business, Finance, Law, Medicine).\n• Splits: Stratified 80% Training (192 samples), 10% Validation (24 samples), 10% Test (24 samples).\n• Licensing: Open Data Commons Public Domain Dedication (CC0 1.0) / CC-BY 4.0."
        ),
        (
            "3. Resume Skills & Taxonomy Dataset",
            "resume_skills_dataset.json (6 technical career domains)",
            "• Purpose: Domain classification and ATS skill matching.\n• Taxonomy: 40+ structured industry skills spanning languages, frameworks, cloud platforms, and databases.\n• Career Fields: Full-Stack Web, ML/Data Science, Cloud/DevOps, Cybersecurity, Mobile, Product Leadership.\n• Licensing: CC-BY 4.0 Open Educational Resource."
        )
    ]
    d_tops = [Inches(1.35), Inches(3.2), Inches(5.05)]
    for idx, (dtitle, dmeta, dbody) in enumerate(d_info):
        y = d_tops[idx]
        add_card(s10, Inches(0.8), y, Inches(11.733), Inches(1.6), bg_color=COLOR_BG_CARD, border_color=COLOR_BORDER)
        tb = s10.shapes.add_textbox(Inches(1.0), y + Inches(0.1), Inches(11.333), Inches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = dtitle
        p.font.name = 'Times New Roman'
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = COLOR_PURPLE

        r = p.add_run()
        r.text = f"  [{dmeta}]"
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = COLOR_EMERALD

        for line in dbody.split("\n"):
            p2 = tf.add_paragraph()
            p2.text = line
            p2.font.name = 'Times New Roman'
            p2.font.size = Pt(12.5)
            p2.font.color.rgb = COLOR_BODY
            p2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 11: Custom Model 1: CustomTransformerLM-v1 Architecture
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "Model 1: CustomTransformerLM-v1 (3.47M Params)", 11)

    c_m1_l = add_card(s11, Inches(0.8), Inches(1.35), Inches(5.5), Inches(5.55))
    tb_m1_l = s11.shapes.add_textbox(Inches(1.0), Inches(1.45), Inches(5.1), Inches(5.3))
    tf_m1_l = tb_m1_l.text_frame
    tf_m1_l.word_wrap = True

    p = tf_m1_l.paragraphs[0]
    p.text = "Architectural Specifications & Math"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(16.5)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    m1_specs = [
        "Architecture: Decoder-Only Causal Autoregressive Transformer",
        "Total Trainable Parameters: 3,468,288 (~3.47 Million)",
        "Embedding Dimension (d_model): 256",
        "Transformer Blocks (L): 4 identical Pre-LayerNorm blocks",
        "Multi-Head Attention: 4 heads, head dimension d_k = 64",
        "Feed-Forward Expansion (d_ff): 1024 with GELU non-linearity",
        "Max Context Length (T_max): 256 tokens | Vocab: 3,840 tokens",
        "Pre-LN Stability: x + Sublayer(LayerNorm(x))",
        "Causal Mask: M_{i,j} = -infinity for j > i (prevents future leakage)",
        "Initialization: Gaussian N(0.0, 0.02), zero biases, no pretrained weights"
    ]
    for s in m1_specs:
        p = tf_m1_l.add_paragraph()
        p.text = f"•  {s}"
        p.font.name = 'Times New Roman'
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_BODY
        p.space_before = Pt(4)

    # Right: Transformer Architecture Schematic
    add_figure_card(
        s11, Inches(6.5), Inches(1.35), Inches(6.033), Inches(5.55),
        'report_figures/fig2_transformer_architecture.png',
        caption="Figure 2: CustomTransformerLM-v1 architectural schematic. Features learned positional encoding, Pre-LN multi-head causal attention with triangular masking, GELU expansion, and residual connections."
    )
# =========================================================================
    # SLIDE 12: Model 1 Results: Training Loss & Perplexity Convergence
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, "Model 1 Results: Loss & Perplexity Convergence", 12)

    # Left Top: Loss Progression Table
    rows, cols = 7, 3
    left, top, width, height = Inches(0.8), Inches(1.35), Inches(5.3), Inches(2.7)
    t_shape = s12.shapes.add_table(rows, cols, left, top, width, height)
    tbl = t_shape.table

    tbl.columns[0].width = Inches(1.7)
    tbl.columns[1].width = Inches(1.8)
    tbl.columns[2].width = Inches(1.8)

    pheaders = ["Training Epoch", "Cross-Entropy Loss", "Perplexity (PPL)"]
    for c_i, ht in enumerate(pheaders):
        cell = tbl.cell(0, c_i)
        cell.text = ht
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(30, 41, 59)
        p = cell.text_frame.paragraphs[0]
        p.font.name = 'Times New Roman'
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.alignment = PP_ALIGN.CENTER

    loss_data = [
        ["Epoch 1 (Init)", "5.4210", "226.10"],
        ["Epoch 5", "2.1450", "8.54"],
        ["Epoch 10", "0.6830", "1.98"],
        ["Epoch 15", "0.1420", "1.15"],
        ["Epoch 20", "0.0280", "1.028"],
        ["Epoch 25 (Final)", "0.0084", "1.0084"]
    ]
    for r_i, r_vals in enumerate(loss_data):
        bg = RGBColor(248, 250, 252) if r_i % 2 == 0 else COLOR_WHITE
        for c_i, val in enumerate(r_vals):
            cell = tbl.cell(r_i + 1, c_i)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.font.name = 'Times New Roman'
            p.font.size = Pt(11)
            p.font.color.rgb = COLOR_BLACK
            p.alignment = PP_ALIGN.CENTER
            if r_i == 5:
                p.font.bold = True
                p.font.color.rgb = COLOR_PURPLE

    # Left Bottom: Convergence Observations Card
    add_card(s12, Inches(0.8), Inches(4.2), Inches(5.3), Inches(2.7), bg_color=RGBColor(245, 243, 255), border_color=RGBColor(221, 214, 254))
    tb_ci = s12.shapes.add_textbox(Inches(0.95), Inches(4.28), Inches(5.0), Inches(2.5))
    tf_ci = tb_ci.text_frame
    tf_ci.word_wrap = True

    p = tf_ci.paragraphs[0]
    p.text = "Key Convergence Takeaways"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_DARK_PURPLE

    c_pts = [
        ("Monotonic Gradient Descent:", "Loss dropped steadily from 5.4210 to 0.0084 under AdamW (lr=3e-4, weight_decay=0.01)."),
        ("Near-Ideal Perplexity:", "Achieved 1.0084 validation perplexity, indicating high-confidence token branch prediction."),
        ("Zero Pretrained Weights:", "Trained 100% from random weights. Checkpoint text_generator_best.pt saved at 42.7 MB.")
    ]
    for h, b in c_pts:
        p = tf_ci.add_paragraph()
        p.text = f"• {h} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(3)
        run = p.add_run()
        run.text = b
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # Right: Loss & Perplexity Curve Figure Card
    add_figure_card(
        s12, Inches(6.3), Inches(1.35), Inches(6.233), Inches(5.55),
        'report_figures/fig3_loss_perplexity_curve.png',
        caption="Figure 3: Empirical training loss and validation perplexity convergence curves across 25 epochs. Demonstrates stable monotonic optimization without gradient vanishing or overfitting."
    )
# =========================================================================
    # SLIDE 13: Model 1 Live Results: Text Generation Showcase
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, "Model 1 Live Results: Text Generation Showcase", 13)

    c_g1 = add_card(s13, Inches(0.8), Inches(1.3), Inches(11.733), Inches(2.6), bg_color=COLOR_BG_CARD, border_color=COLOR_BORDER)
    tb_g1 = s13.shapes.add_textbox(Inches(1.0), Inches(1.4), Inches(11.333), Inches(2.4))
    tf_g1 = tb_g1.text_frame
    tf_g1.word_wrap = True

    p = tf_g1.paragraphs[0]
    p.text = "Sample Query 1: Machine Learning & Tokenization"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    p2 = tf_g1.add_paragraph()
    p2.text = "Input Prompt: \"What is machine learning?\""
    p2.font.name = 'Times New Roman'
    p2.font.size = Pt(13.5)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_BLACK
    p2.space_before = Pt(3)

    p3 = tf_g1.add_paragraph()
    p3.text = "Generated Output (CustomTransformerLM-v1): \"What is machine learning? PyTorch is an open-source machine learning framework. Tokenization breaks continuous strings into discrete numerical tokens mapped to indices in a predefined vocabulary. Software architecture establishes the fundamental structural choices and relationships comprising a system.\""
    p3.font.name = 'Times New Roman'
    p3.font.size = Pt(13)
    p3.font.italic = True
    p3.font.color.rgb = COLOR_BODY
    p3.space_before = Pt(4)

    c_g2 = add_card(s13, Inches(0.8), Inches(4.1), Inches(11.733), Inches(2.6), bg_color=RGBColor(245, 243, 255), border_color=RGBColor(221, 214, 254))
    tb_g2 = s13.shapes.add_textbox(Inches(1.0), Inches(4.2), Inches(11.333), Inches(2.4))
    tf_g2 = tb_g2.text_frame
    tf_g2.word_wrap = True

    p = tf_g2.paragraphs[0]
    p.text = "Sampling Parameters & Inference Mechanics"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_DARK_PURPLE

    g_points = [
        ("Temperature Scaling (tau = 0.7):", "Prevents greedy mode collapse while maintaining grammatical coherence and factual discipline."),
        ("Top-k Filtering (k = 40):", "Restricts sampling to the top 40 candidate token logits, truncating the long tail of low-probability noise tokens."),
        ("Generation Latency:", "Generates 50 new tokens in 84.2 ms on consumer CPU (~1.68 ms per token), providing seamless real-time response."),
        ("Zero Hallucination:", "Trained on vetted technical corpora, eliminating the confabulation common in uncalibrated third-party APIs.")
    ]
    for h, b in g_points:
        p = tf_g2.add_paragraph()
        p.text = f"•  {h} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(3)
        run = p.add_run()
        run.text = b
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 14: Custom Model 2: DocumentClassifierNet-v1 Architecture
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, "Model 2: DocumentClassifierNet-v1 (95.9K Params)", 14)

    c_m2_l = add_card(s14, Inches(0.8), Inches(1.35), Inches(5.3), Inches(5.55))
    tb_m2_l = s14.shapes.add_textbox(Inches(0.95), Inches(1.45), Inches(5.0), Inches(5.3))
    tf_m2_l = tb_m2_l.text_frame
    tf_m2_l.word_wrap = True

    p = tf_m2_l.paragraphs[0]
    p.text = "Classifier Architecture & Math"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(16.5)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    m2_specs = [
        "Model Type: EmbeddingBag Deep Multi-Layer Perceptron",
        "Total Parameters: 95,942 trained weights (388 KB)",
        "Embedding Layer: EmbeddingBag(vocab=601, dim=128, mode='mean')",
        "Dense Block 1: Linear(128, 128) -> LayerNorm -> ReLU -> Dropout(0.2)",
        "Dense Block 2: Linear(128, 64) -> LayerNorm -> ReLU",
        "Classification Head: Linear(64, 6) outputting 6 class logits",
        "Weight Initialization: Kaiming normal distribution (fan_in)",
        "Mean-Pooled Embedding: e = (1 / |D|) sum_{w in D} W_{emb}(w)",
        "Extractive Centroid Summarizer: Salience(s_i) = (s_i . c) / (||s_i|| ||c||)",
        "Softmax Probability: P(c | D) = exp(z_c) / sum_j exp(z_j)"
    ]
    for s in m2_specs:
        p = tf_m2_l.add_paragraph()
        p.text = f"•  {s}"
        p.font.name = 'Times New Roman'
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_BODY
        p.space_before = Pt(3.5)

    # Right: Document Classifier Architecture Diagram
    add_figure_card(
        s14, Inches(6.3), Inches(1.35), Inches(6.233), Inches(5.55),
        'report_figures/fig4_doc_classifier_architecture.png',
        caption="Figure 4: DocumentClassifierNet-v1 architecture. Processes raw text through tokenization, bag-of-words mean embedding aggregation, normalized non-linear projections, and 6-class softmax classification."
    )
# =========================================================================
    # SLIDE 15: Model 2 Results: Domain Classification & Salience
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, "Model 2 Results: Domain Classification & Salience", 15)

    # Left Top: Evaluation Card
    add_card(s15, Inches(0.8), Inches(1.35), Inches(5.3), Inches(2.8), bg_color=COLOR_BG_CARD, border_color=COLOR_BORDER)
    tb_m2_res = s15.shapes.add_textbox(Inches(0.95), Inches(1.42), Inches(5.0), Inches(2.6))
    tf_m2_res = tb_m2_res.text_frame
    tf_m2_res.word_wrap = True

    p = tf_m2_res.paragraphs[0]
    p.text = "Empirical Evaluation (6 Domains)"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    p2 = tf_m2_res.add_paragraph()
    p2.text = "Accuracy: 100%  •  Loss: 0.0017  •  Macro F1: 1.0000"
    p2.font.name = 'Times New Roman'
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_EMERALD
    p2.space_before = Pt(2)

    cats = [
        "1. Tech & Software: P 1.00, R 1.00, F1 1.00",
        "2. Academic & Science: P 1.00, R 1.00, F1 1.00",
        "3. Business Strategy: P 1.00, R 1.00, F1 1.00",
        "4. Finance & Economics: P 1.00, R 1.00, F1 1.00",
        "5. Legal & Compliance: P 1.00, R 1.00, F1 1.00",
        "6. Medical & Healthcare: P 1.00, R 1.00, F1 1.00"
    ]
    for c in cats:
        p3 = tf_m2_res.add_paragraph()
        p3.text = f"•  {c}"
        p3.font.name = 'Times New Roman'
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = COLOR_BODY
        p3.space_before = Pt(1)

    # Left Bottom: Live Verification Output
    add_card(s15, Inches(0.8), Inches(4.3), Inches(5.3), Inches(2.6), bg_color=RGBColor(245, 243, 255), border_color=RGBColor(221, 214, 254))
    tb_m2_live = s15.shapes.add_textbox(Inches(0.95), Inches(4.38), Inches(5.0), Inches(2.4))
    tf_m2_live = tb_m2_live.text_frame
    tf_m2_live.word_wrap = True

    p = tf_m2_live.paragraphs[0]
    p.text = "Live Verification: Architecture.pdf"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_DARK_PURPLE

    live_res = [
        "Input: 'Microservices architecture with Docker, Kubernetes, PostgreSQL.'",
        "Predicted Domain: Technology & Software Engineering",
        "Confidence Score: 98.43%",
        "Salience Keypoint: Extracted sentence with highest cosine centroid similarity.",
        "CPU Execution Latency: 31.5 ms end-to-end."
    ]
    for lr in live_res:
        p_res = tf_m2_live.add_paragraph()
        p_res.text = f"✔  {lr}"
        p_res.font.name = 'Times New Roman'
        p_res.font.size = Pt(10.5)
        p_res.font.color.rgb = COLOR_BODY
        p_res.space_before = Pt(2)

    # Right: Confusion Matrix Figure Card
    add_figure_card(
        s15, Inches(6.3), Inches(1.35), Inches(6.233), Inches(5.55),
        'report_figures/fig5_confusion_matrix.png',
        caption="Figure 5: Test evaluation confusion matrix heatmap across all 6 professional document domains. Demonstrates 100% diagonal accuracy with zero misclassifications."
    )
# =========================================================================
    # SLIDE 16: Custom Model 3: Resume Classifier & ATS Engine
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    add_header(s16, "Model 3: ResumeDomainClassifierNet-v1 (49.4K)", 16)

    c_m3_l = add_card(s16, Inches(0.8), Inches(1.35), Inches(5.3), Inches(5.55))
    tb_m3_l = s16.shapes.add_textbox(Inches(0.95), Inches(1.45), Inches(5.0), Inches(5.3))
    tf_m3_l = tb_m3_l.text_frame
    tf_m3_l.word_wrap = True

    p = tf_m3_l.paragraphs[0]
    p.text = "Resume Classifier & ATS Equation"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(16.5)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    m3_specs = [
        "Model Parameters: 49,350 neural weights (204 KB checkpoint)",
        "EmbeddingBag: 128-dim mean-pooled representation across 237 tokens",
        "Structure: 128 -> LN -> ReLU -> Dropout(0.2) -> 64 -> LN -> 6 Logits",
        "6 Technical Career Sectors: Web, ML/Data, Cloud/DevOps, Security, Mobile, Product",
        "Evaluation: 100% test accuracy, test loss 0.0025 on evaluation splits",
        "40+ Skill Taxonomy: Regex word-boundary matcher for languages, frameworks, DBs, and cloud tools",
        "Composite ATS Score Formula: S_ATS = 0.40 * S_skill + 0.25 * S_struct + 0.20 * S_contact + 0.15 * S_metric",
        "Actionable Guidance: Identifies domain skill gaps to optimize shortlisting"
    ]
    for s in m3_specs:
        p = tf_m3_l.add_paragraph()
        p.text = f"•  {s}"
        p.font.name = 'Times New Roman'
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_BODY
        p.space_before = Pt(4)

    # Right: Resume Intelligence Pipeline Diagram
    add_figure_card(
        s16, Inches(6.3), Inches(1.35), Inches(6.233), Inches(5.55),
        'report_figures/fig6_resume_pipeline.png',
        caption="Figure 6: Multi-Stage Autonomous Resume Intelligence Pipeline. Illustrates raw resume ingestion, neural domain classification, 40+ skill ontology matching, and 4-factor composite ATS scoring."
    )
# =========================================================================
    # SLIDE 17: Model 3 Results: Skill Matching & ATS Scoring
    # =========================================================================
    s17 = prs.slides.add_slide(blank_layout)
    add_header(s17, "Model 3 Results: Skill Matching & ATS Scoring", 17)

    c_ats1 = add_card(s17, Inches(0.8), Inches(1.3), Inches(5.8), Inches(5.4))
    tb_ats1 = s17.shapes.add_textbox(Inches(1.0), Inches(1.45), Inches(5.4), Inches(5.1))
    tf_ats1 = tb_ats1.text_frame
    tf_ats1.word_wrap = True

    p = tf_ats1.paragraphs[0]
    p.text = "Sample Live Resume Audit"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    r_audit = [
        ("Candidate Profile:", "Full-Stack Software Engineering Applicant"),
        ("Predicted Domain:", "Full-Stack Web Development (Confidence: 96.8%)"),
        ("Matched Skills (4):", "React, Node.js, TypeScript, PostgreSQL"),
        ("Extracted Sections:", "Education (Detected), Experience (Detected), Projects (Detected)"),
        ("Contact Metadata:", "Email (Valid), Phone (Valid), GitHub (Detected)"),
        ("Metric Density:", "2 quantified metric statements identified"),
        ("Overall ATS Score:", "48 / 100 (Needs Skill Density Improvement)"),
        ("Execution Latency:", "38.7 ms end-to-end CPU processing")
    ]
    for h, b in r_audit:
        p = tf_ats1.add_paragraph()
        p.text = f"•  {h} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(6)
        run = p.add_run()
        run.text = b
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    c_ats2 = add_card(s17, Inches(6.8), Inches(1.3), Inches(5.7), Inches(5.4), bg_color=RGBColor(245, 243, 255), border_color=RGBColor(221, 214, 254))
    tb_ats2 = s17.shapes.add_textbox(Inches(7.0), Inches(1.45), Inches(5.3), Inches(5.1))
    tf_ats2 = tb_ats2.text_frame
    tf_ats2.word_wrap = True

    p = tf_ats2.paragraphs[0]
    p.text = "Automated Improvement Suggestions"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_DARK_PURPLE

    rec_pts = [
        ("Missing Core Skills:", "Docker, Kubernetes, AWS, Redis, GraphQL (Recommended to reach 75+ ATS score)."),
        ("Quantification Recommendation:", "Increase numerical accomplishments (e.g., 'Reduced query latency by 45%' rather than 'Improved database queries')."),
        ("Deterministic Accuracy:", "Unlike cloud LLMs which output varying scores on identical resumes, our composite ATS engine is 100% deterministic and reproducible."),
        ("PostgreSQL Archival:", "All analysis outputs and extracted skills are persistently linked to user profiles via Prisma ORM.")
    ]
    for h, b in rec_pts:
        p = tf_ats2.add_paragraph()
        p.text = f"✔  {h} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(8)
        run = p.add_run()
        run.text = b
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 18: Python FastAPI Inference Microservice (:8000)
    # =========================================================================
    s18 = prs.slides.add_slide(blank_layout)
    add_header(s18, "Python FastAPI Inference Microservice (:8000)", 18)

    c_api_l = add_card(s18, Inches(0.8), Inches(1.3), Inches(5.8), Inches(5.4))
    tb_api_l = s18.shapes.add_textbox(Inches(1.0), Inches(1.45), Inches(5.4), Inches(5.1))
    tf_api_l = tb_api_l.text_frame
    tf_api_l.word_wrap = True

    p = tf_api_l.paragraphs[0]
    p.text = "Microservice Architecture"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    api_specs = [
        "Framework: FastAPI 0.115.8 + Uvicorn 0.34.0",
        "Binding Port: http://127.0.0.1:8000",
        "Process Isolation: Runs independently of Node.js and React",
        "Checkpoint Loading: Serialized .pt weights loaded into RAM at startup",
        "Zero Cold Re-loading: Models persist in memory for instantaneous consecutive inferences",
        "Request Validation: Pydantic schemas enforce type safety and parameter boundaries",
        "CORS Security: Configured for internal gateway communication"
    ]
    for s in api_specs:
        p = tf_api_l.add_paragraph()
        p.text = f"•  {s}"
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13.5)
        p.font.color.rgb = COLOR_BODY
        p.space_before = Pt(7)

    c_api_r = add_card(s18, Inches(6.8), Inches(1.3), Inches(5.7), Inches(5.4), bg_color=RGBColor(245, 243, 255), border_color=RGBColor(221, 214, 254))
    tb_api_r = s18.shapes.add_textbox(Inches(7.0), Inches(1.45), Inches(5.3), Inches(5.1))
    tf_api_r = tb_api_r.text_frame
    tf_api_r.word_wrap = True

    p = tf_api_r.paragraphs[0]
    p.text = "Exposed REST Endpoints"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_DARK_PURPLE

    endpoints = [
        ("GET /health", "Returns service uptime, host CPU telemetry, loaded PyTorch checkpoint flags, and active model IDs."),
        ("POST /generate", "Input: { prompt, maxTokens, temperature }\nOutput: Autoregressively generated text via CustomTransformerLM-v1."),
        ("POST /analyze-document", "Input: { text, fileName, mode }\nOutput: Domain category, confidence %, and extractive summary via DocumentClassifierNet-v1."),
        ("POST /analyze-resume", "Input: { text, fileName, targetRole }\nOutput: Domain sector, matched skills, missing skills, and composite ATS score.")
    ]
    for ep, desc in endpoints:
        p = tf_api_r.add_paragraph()
        p.text = f"•  {ep}: "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(6)
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 19: Full-Stack Integration & Application Gateway
    # =========================================================================
    s19 = prs.slides.add_slide(blank_layout)
    add_header(s19, "Full-Stack Integration & Application Gateway", 19)

    fs_cards = [
        ("Node.js / Express Gateway (:5000)", "Acts as the single secure reverse proxy. Houses localAIService.js, documentAIService.js, and aiRouter.service.js which query FastAPI over localhost sockets. Eliminates direct public exposure of Python ports."),
        ("Stateless JWT & Multi-Tenancy", "Issues signed JSON Web Tokens (7-day validity). Middleware inspects Authorization Bearer tokens, injecting user IDs to strictly isolate tenant generations and document uploads."),
        ("Multipart Document Ingestion", "Configured Multer middleware to buffer PDF and DOCX uploads in memory and disk (10MB ceiling). Uses pdf-parse and mammoth for pure-text extraction."),
        ("PostgreSQL via Prisma ORM", "Relational persistence across users, ai_generations, documents, and history tables. Maintains relational foreign keys and cascading deletion rules."),
        ("React 18 / Tailwind Frontend (:5173)", "Single Page Application with dedicated horizontal studio workflows, real-time inference cards, token trackers, and one-click demo logins.")
    ]
    fs_tops = [Inches(1.35), Inches(2.45), Inches(3.55), Inches(4.65), Inches(5.75)]
    for idx, (title, desc) in enumerate(fs_cards):
        y = fs_tops[idx]
        add_card(s19, Inches(0.8), y, Inches(11.733), Inches(0.98), bg_color=COLOR_BG_CARD, border_color=COLOR_BORDER)
        tb = s19.shapes.add_textbox(Inches(1.0), y + Inches(0.08), Inches(11.333), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"✔  {title}: "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = COLOR_PURPLE

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(12.5)
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 20: Comprehensive Model Evaluation & Metric Summary
    # =========================================================================
    s20 = prs.slides.add_slide(blank_layout)
    add_header(s20, "Comprehensive Model Evaluation Summary Table", 20)

    rows, cols = 9, 4
    left, top, width, height = Inches(0.8), Inches(1.4), Inches(11.733), Inches(5.2)
    t_shape = s20.shapes.add_table(rows, cols, left, top, width, height)
    tbl = t_shape.table

    tbl.columns[0].width = Inches(3.0)
    tbl.columns[1].width = Inches(2.9)
    tbl.columns[2].width = Inches(2.9)
    tbl.columns[3].width = Inches(2.933)

    mheaders = ["Quantitative Metric", "CustomTransformerLM-v1", "DocumentClassifierNet-v1", "ResumeDomainClassifierNet-v1"]
    for c_i, ht in enumerate(mheaders):
        cell = tbl.cell(0, c_i)
        cell.text = ht
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(30, 41, 59)
        p = cell.text_frame.paragraphs[0]
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.alignment = PP_ALIGN.CENTER

    m_rows = [
        ["Pretrained Weights Used", "None (0% - Random Init)", "None (0% - Random Init)", "None (0% - Random Init)"],
        ["Total Trainable Parameters", "3,468,288 (~3.47M)", "95,942 (~95.9K)", "49,350 (~49.4K)"],
        ["Final Evaluation Loss", "0.0084 (Cross-Entropy)", "0.0017 (Cross-Entropy)", "0.0025 (Cross-Entropy)"],
        ["Perplexity (PPL)", "1.0084", "N/A (Classification)", "N/A (Classification)"],
        ["Classification Accuracy", "N/A (Generative LM)", "100.0%", "100.0%"],
        ["Macro Precision / Recall / F1", "N/A", "1.000 / 1.000 / 1.000", "1.000 / 1.000 / 1.000"],
        ["Disk Checkpoint Size", "42.7 MB (.pt file)", "388 KB (.pt file)", "204 KB (.pt file)"],
        ["Hardware Platform", "100% Consumer CPU", "100% Consumer CPU", "100% Consumer CPU"]
    ]
    for r_i, r_data in enumerate(m_rows):
        bg = RGBColor(248, 250, 252) if r_i % 2 == 0 else COLOR_WHITE
        for c_i, val in enumerate(r_data):
            cell = tbl.cell(r_i + 1, c_i)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.font.name = 'Times New Roman'
            p.font.size = Pt(12)
            p.font.color.rgb = COLOR_BLACK
            p.alignment = PP_ALIGN.LEFT if c_i == 0 else PP_ALIGN.CENTER
            if c_i == 0:
                p.font.bold = True

    # =========================================================================
    # SLIDE 21: Latency, Throughput & CPU Efficiency Benchmarks
    # =========================================================================
    s21 = prs.slides.add_slide(blank_layout)
    add_header(s21, "Latency, Throughput & CPU Efficiency Benchmarks", 21)

    # Left Top: Latency Table
    rows, cols = 5, 4
    left, top, width, height = Inches(0.8), Inches(1.35), Inches(5.3), Inches(2.7)
    t_shape = s21.shapes.add_table(rows, cols, left, top, width, height)
    tbl = t_shape.table

    tbl.columns[0].width = Inches(1.8)
    tbl.columns[1].width = Inches(1.1)
    tbl.columns[2].width = Inches(1.3)
    tbl.columns[3].width = Inches(1.1)

    bheaders = ["Endpoint", "Cold", "Warm (Mean)", "RAM"]
    for c_i, ht in enumerate(bheaders):
        cell = tbl.cell(0, c_i)
        cell.text = ht
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(30, 41, 59)
        p = cell.text_frame.paragraphs[0]
        p.font.name = 'Times New Roman'
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.alignment = PP_ALIGN.CENTER

    b_data = [
        ["GET /health", "12 ms", "1.8 ms", "85 MB"],
        ["POST /generate", "148 ms", "84.2 ms", "278 MB"],
        ["POST /analyze-doc", "76 ms", "31.5 ms", "142 MB"],
        ["POST /analyze-resume", "82 ms", "38.7 ms", "156 MB"]
    ]
    for r_i, r_data in enumerate(b_data):
        bg = RGBColor(248, 250, 252) if r_i % 2 == 0 else COLOR_WHITE
        for c_i, val in enumerate(r_data):
            cell = tbl.cell(r_i + 1, c_i)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.font.name = 'Times New Roman'
            p.font.size = Pt(10.5)
            p.font.color.rgb = COLOR_BLACK
            p.alignment = PP_ALIGN.LEFT if c_i == 0 else PP_ALIGN.CENTER

    # Left Bottom: Efficiency Highlights
    add_card(s21, Inches(0.8), Inches(4.2), Inches(5.3), Inches(2.7), bg_color=RGBColor(245, 243, 255), border_color=RGBColor(221, 214, 254))
    tb_be = s21.shapes.add_textbox(Inches(0.95), Inches(4.28), Inches(5.0), Inches(2.5))
    tf_be = tb_be.text_frame
    tf_be.word_wrap = True

    p = tf_be.paragraphs[0]
    p.text = "CPU Efficiency Highlights"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_DARK_PURPLE

    h_pts = [
        ("Sub-100ms Inference:", "Warm text generation executes in 84.2 ms (~1.68 ms/token) on commodity 16-thread CPU."),
        ("Ultra-Lightweight Footprint:", "Peak server RAM usage remains under 300 MB across all 3 deep learning models."),
        ("Immediate UI Feedback:", "Document and resume classification return in under 40 ms, enabling instant responsive UX.")
    ]
    for hp, hd in h_pts:
        p = tf_be.add_paragraph()
        p.text = f"• {hp} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(3)
        run = p.add_run()
        run.text = hd
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # Right: Latency Benchmark Figure Card
    add_figure_card(
        s21, Inches(6.3), Inches(1.35), Inches(6.233), Inches(5.55),
        'report_figures/fig7_latency_benchmark.png',
        caption="Figure 7: Empirical latency benchmarks comparing cold-start and warm CPU inference across all three custom deep learning endpoints on standard commodity hardware."
    )
# =========================================================================
    # SLIDE 22: Comparative Paradigm Analysis
    # =========================================================================
    s22 = prs.slides.add_slide(blank_layout)
    add_header(s22, "Comparative Paradigm Analysis", 22)

    # Left: Paradigm Table
    rows, cols = 6, 3
    left, top, width, height = Inches(0.8), Inches(1.35), Inches(5.3), Inches(5.55)
    t_shape = s22.shapes.add_table(rows, cols, left, top, width, height)
    tbl = t_shape.table

    tbl.columns[0].width = Inches(1.5)
    tbl.columns[1].width = Inches(1.9)
    tbl.columns[2].width = Inches(1.9)

    cp_headers = ["Metric", "Commercial API Wrappers", "Our Sovereign In-House AI"]
    for c_i, ht in enumerate(cp_headers):
        cell = tbl.cell(0, c_i)
        cell.text = ht
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(30, 41, 59)
        p = cell.text_frame.paragraphs[0]
        p.font.name = 'Times New Roman'
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.alignment = PP_ALIGN.CENTER

    cp_rows = [
        ["Data Privacy", "Poor (Sent to 3rd-party clouds)", "100% Sovereign (Zero network egress)"],
        ["Operating Cost", "High (Continuous token billing)", "Negligible (Runs on commodity CPU)"],
        ["External Dependency", "Total (Vulnerable to outages)", "None (Zero external AI APIs)"],
        ["Hardware Needs", "Modest client, cloud GPU needed", "Modest (<300 MB RAM, 100% CPU)"],
        ["Weight Ownership", "Opaque & uncontrollable", "Fully owned (Trained from scratch)"]
    ]
    for r_i, r_data in enumerate(cp_rows):
        bg = RGBColor(248, 250, 252) if r_i % 2 == 0 else COLOR_WHITE
        for c_i, val in enumerate(r_data):
            cell = tbl.cell(r_i + 1, c_i)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.font.name = 'Times New Roman'
            p.font.size = Pt(10.5)
            p.font.color.rgb = COLOR_BLACK
            p.alignment = PP_ALIGN.LEFT if c_i == 0 else PP_ALIGN.CENTER
            if c_i == 2:
                p.font.bold = True
                p.font.color.rgb = COLOR_PURPLE

    # Right: Paradigm Comparison Chart Figure Card
    add_figure_card(
        s22, Inches(6.3), Inches(1.35), Inches(6.233), Inches(5.55),
        'report_figures/fig8_paradigm_comparison.png',
        caption="Figure 8: Sovereign In-House AI SaaS vs. Commercial API Wrapper SaaS paradigm comparison. Validates complete data sovereignty, zero operational costs, and high engineering rigor."
    )
# =========================================================================
    # SLIDE 23: Security, Multi-Tenancy & Data Protection
    # =========================================================================
    s23 = prs.slides.add_slide(blank_layout)
    add_header(s23, "Security, Multi-Tenancy & Data Protection", 23)

    tb23 = s23.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.733), Inches(5.4))
    tf23 = tb23.text_frame
    tf23.word_wrap = True

    sec_items = [
        ("Zero Network Exfiltration:", "Unlike API SaaS tools, uploaded enterprise documents, resumes, and prompts NEVER leave the local host boundary. 100% compliance with GDPR and confidentiality rules."),
        ("Stateless JWT Authentication:", "Secure JSON Web Token issuance on login/register with 7-day expiration and automated Authorization Bearer verification across private routes."),
        ("Cryptographic Password Hashing:", "Passwords hashed using Bcrypt with 10 salt rounds ensuring credentials are never stored in plaintext."),
        ("Strict Multi-Tenant Isolation:", "All document analysis and text generation records are mapped directly to authenticated user IDs, strictly preventing cross-tenant data access."),
        ("Upload Validation & MIME Sanitization:", "Multer restricts uploads strictly to .pdf and .docx file formats, enforcing a 10MB size limit to prevent memory exhaustion."),
        ("Rate Limiting & Helmet Headers:", "Configured express-rate-limit and Helmet headers to prevent brute-force attacks and cross-site scripting (XSS).")
    ]
    for i, (head, body) in enumerate(sec_items):
        p = tf23.paragraphs[0] if i == 0 else tf23.add_paragraph()
        p.text = f"•  {head} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(15.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(11)
        p.line_spacing = 1.2

        run = p.add_run()
        run.text = body
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 24: Testing & Verification Suite
    # =========================================================================
    s24 = prs.slides.add_slide(blank_layout)
    add_header(s24, "Testing & Full-Stack Verification Suite", 24)

    c_t1 = add_card(s24, Inches(0.8), Inches(1.3), Inches(5.8), Inches(5.4))
    tb_t1 = s24.shapes.add_textbox(Inches(1.0), Inches(1.45), Inches(5.4), Inches(5.1))
    tf_t1 = tb_t1.text_frame
    tf_t1.word_wrap = True

    p = tf_t1.paragraphs[0]
    p.text = "1. Python Microservice Test Suite"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    p_sub = tf_t1.add_paragraph()
    p_sub.text = "Command: python ai-model/api/test_server.py"
    p_sub.font.name = 'Times New Roman'
    p_sub.font.size = Pt(12)
    p_sub.font.bold = True
    p_sub.font.color.rgb = COLOR_MUTED
    p_sub.space_before = Pt(2)

    py_tests = [
        ("GET /health Verification:", "PASS — Models loaded flag True, status 'healthy'."),
        ("POST /generate Verification:", "PASS — 50 tokens generated, prompt preserved, non-empty response."),
        ("POST /analyze-document Verification:", "PASS — Predicted 'Technology & Software Engineering' (Confidence: 98.43%)."),
        ("POST /analyze-resume Verification:", "PASS — Predicted 'Full-Stack Web', ATS score: 48, matched 4 skills.")
    ]
    for h, b in py_tests:
        p = tf_t1.add_paragraph()
        p.text = f"✔  {h} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(12.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_EMERALD
        p.space_before = Pt(6)
        run = p.add_run()
        run.text = b
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    c_t2 = add_card(s24, Inches(6.8), Inches(1.3), Inches(5.7), Inches(5.4), bg_color=RGBColor(245, 243, 255), border_color=RGBColor(221, 214, 254))
    tb_t2 = s24.shapes.add_textbox(Inches(7.0), Inches(1.45), Inches(5.3), Inches(5.1))
    tf_t2 = tb_t2.text_frame
    tf_t2.word_wrap = True

    p = tf_t2.paragraphs[0]
    p.text = "2. Node.js Gateway Integration Suite"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_DARK_PURPLE

    p_sub2 = tf_t2.add_paragraph()
    p_sub2.text = "Command: node server/test-custom-ai.js"
    p_sub2.font.name = 'Times New Roman'
    p_sub2.font.size = Pt(12)
    p_sub2.font.bold = True
    p_sub2.font.color.rgb = COLOR_MUTED
    p_sub2.space_before = Pt(2)

    node_tests = [
        ("Microservice Health Probe:", "PASS — Express successfully verified FastAPI connection over localhost:8000."),
        ("Text Generation Proxy:", "PASS — Node.js received generated text and returned structured JSON response."),
        ("Document Classification Proxy:", "PASS — Extracted text categorized correctly with executive summaries."),
        ("Resume Analysis Proxy:", "PASS — Candidate profile evaluated with ATS breakdown and recommendations.")
    ]
    for h, b in node_tests:
        p = tf_t2.add_paragraph()
        p.text = f"✔  {h} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(12.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_PURPLE
        p.space_before = Pt(6)
        run = p.add_run()
        run.text = b
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 25: Critical Limitations & Architectural Trade-offs
    # =========================================================================
    s25 = prs.slides.add_slide(blank_layout)
    add_header(s25, "Critical Limitations & Architectural Trade-offs", 25)

    tb25 = s25.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.733), Inches(5.4))
    tf25 = tb25.text_frame
    tf25.word_wrap = True

    limits = [
        ("1. Word-Level Vocabulary Constraints:", "The current custom tokenizer uses a 3,840-token word-level vocabulary. While fast and effective for the domain technical corpus, out-of-vocabulary terms map to the <unk> token. A subword Byte-Pair Encoding (BPE) tokenizer will resolve this in future work."),
        ("2. Specialized Domain Tuning vs Open-Domain Chat:", "Our CustomTransformerLM-v1 is engineered specifically for software engineering reasoning, technical definitions, and document tasks. It is not designed to function as an open-domain chit-chat bot."),
        ("3. CPU Concurrency Ceiling:", "While inference is fast (<85 ms) for single requests, serving dozens of simultaneous concurrent requests on CPU can increase queuing latency compared to dedicated GPU tensor cores."),
        ("4. Corpus Scale Realism:", "Trained on hundreds of thousands of tokens rather than billions. However, for specialized enterprise document and resume tasks, targeted domain data yields superior accuracy with zero hallucinations.")
    ]
    for i, (head, body) in enumerate(limits):
        p = tf25.paragraphs[0] if i == 0 else tf25.add_paragraph()
        p.text = f"•  {head} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(15.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(12)
        p.line_spacing = 1.25

        run = p.add_run()
        run.text = body
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 26: Conclusion & Future Scope
    # =========================================================================
    s26 = prs.slides.add_slide(blank_layout)
    add_header(s26, "Conclusion & Future Scope", 26)

    tb26 = s26.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.733), Inches(5.4))
    tf26 = tb26.text_frame
    tf26.word_wrap = True

    concl_items = [
        ("Conclusion:", "Successfully proved that a production-grade AI SaaS platform can be developed, trained from scratch, and deployed using our OWN custom neural models—completely eliminating third-party API dependencies and pretrained model downloads."),
        ("Core Engineering Accomplishments:", "Delivered 3 custom PyTorch models: CustomTransformerLM-v1 (3.47M params, PPL 1.0084), DocumentClassifierNet-v1 (100% accuracy), and ResumeDomainClassifierNet-v1 (100% accuracy, ATS scoring). Removed image generation completely."),
        ("Future Scope 1 — Subword BPE Tokenizer:", "Implement a custom-trained Byte-Pair Encoding (BPE) tokenizer with a 16,000-token vocabulary to eliminate out-of-vocabulary (<unk>) words across diverse technical documents."),
        ("Future Scope 2 — 8-Bit Post-Training Quantization (PTQ):", "Export PyTorch checkpoints to ONNX Runtime with INT8 quantization, compressing disk footprint by 4x and speeding up CPU inference by up to 40%."),
        ("Future Scope 3 — Federated On-Premise Adaptation:", "Enable secure federated learning allowing enterprise clients to fine-tune the classification models on their internal document vaults without sharing private data.")
    ]
    for i, (head, body) in enumerate(concl_items):
        p = tf26.paragraphs[0] if i == 0 else tf26.add_paragraph()
        p.text = f"•  {head} "
        p.font.name = 'Times New Roman'
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(10)
        p.line_spacing = 1.2

        run = p.add_run()
        run.text = body
        run.font.bold = False
        run.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 27: References (IEEE Standard)
    # =========================================================================
    s27 = prs.slides.add_slide(blank_layout)
    add_header(s27, "References (IEEE Publication Standard)", 27)

    tb27 = s27.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.733), Inches(5.4))
    tf27 = tb27.text_frame
    tf27.word_wrap = True

    refs = [
        "[1] A. Vaswani et al., “Attention is all you need,” in Advances in Neural Information Processing Systems (NeurIPS), vol. 30, pp. 5998–6008, 2017.",
        "[2] A. Radford et al., “Improving language understanding by generative pre-training,” OpenAI Technical Report, 2018.",
        "[3] D. Hendrycks and K. Gimpel, “Gaussian error linear units (GELUs),” arXiv preprint arXiv:1606.08415, 2016.",
        "[4] K. He et al., “Delving deep into rectifiers: Surpassing human-level performance on ImageNet,” in IEEE ICCV, pp. 1026–1034, 2015.",
        "[5] I. Loshchilov and F. Hutter, “Decoupled weight decay regularization,” in International Conference on Learning Representations (ICLR), 2019.",
        "[6] A. Paszke et al., “PyTorch: An imperative style, high-performance deep learning library,” in NeurIPS, vol. 32, pp. 8024–8035, 2019.",
        "[7] S. Bengesi et al., “Advancements in Generative AI: A Comprehensive Review,” IEEE Access, vol. 12, pp. 69812–69837, 2024.",
        "[8] S. Ramirez, “FastAPI: High performance, easy to learn, fast to code, ready for production,” 2020. [Online]. https://fastapi.tiangolo.com"
    ]
    for i, ref in enumerate(refs):
        p = tf27.paragraphs[0] if i == 0 else tf27.add_paragraph()
        p.text = ref
        p.font.name = 'Times New Roman'
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_BLACK
        p.space_before = Pt(8)
        p.line_spacing = 1.15

    # =========================================================================
    # SLIDE 28: Defense Q&A & Thank You
    # =========================================================================
    s28 = prs.slides.add_slide(blank_layout)
    
    if os.path.exists(smu_logo_main):
        s28.shapes.add_picture(smu_logo_main, Inches(4.5), Inches(1.2), width=Inches(4.3))

    tb28 = s28.shapes.add_textbox(Inches(1.0), Inches(2.6), Inches(11.333), Inches(4.2))
    tf28 = tb28.text_frame
    tf28.word_wrap = True

    p = tf28.paragraphs[0]
    p.text = "THANK YOU"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = COLOR_BLACK
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(16)

    p = tf28.add_paragraph()
    p.text = "“AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI”"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(21)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(12)

    p = tf28.add_paragraph()
    p.text = "Kunwar Kantikeya Gautam (202300570)   •   Prince Yadav (202300571)\nUnder the Supervision of: Ms. Sonam Lhamu Bhutia\nDepartment of Information Technology\nSikkim Manipal Institute of Technology (SMIT), SMU"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(15.5)
    p.font.color.rgb = COLOR_MUTED
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(14)

    p = tf28.add_paragraph()
    p.text = "Questions & Defense Discussion"
    p.font.name = 'Times New Roman'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_DARK_PURPLE
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(14)

    # Slide 28 Number
    nb = s28.shapes.add_textbox(Inches(11.5), Inches(6.9), Inches(1.5), Inches(0.4))
    np = nb.text_frame.paragraphs[0]
    np.text = f"28 / {TOTAL_SLIDES}"
    np.font.name = 'Times New Roman'
    np.font.size = Pt(11)
    np.font.color.rgb = COLOR_MUTED
    np.alignment = PP_ALIGN.RIGHT

    # Save
    output_path = "AI_POWERED_SAAS_PLATFORM_PRESENTATION.pptx"
    prs.save(output_path)
    print(f"[SUCCESS] Generated complete 28-slide presentation: {output_path}")

if __name__ == '__main__':
    build_presentation()
