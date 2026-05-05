% ============================================================
% FINAL PROJECT REPORT --- ABAP19 Configuration Management
% FPT University Capstone Project --- Group GSP26
% Format: Times New Roman 12pt, 1.5 spacing, A4
% Margins: Top 2.5cm, Bottom 2.5cm, Left 3.5cm, Right 2cm
% ============================================================
\documentclass[12pt,a4paper]{report}

% --- Encoding ---
\usepackage{fontspec}
\setmainfont{Times New Roman} % Times New Roman (text + math)

% --- Page layout ---
\usepackage[top=2.5cm,bottom=2.5cm,left=3.5cm,right=2cm]{geometry}
\usepackage{setspace}
\onehalfspacing % 1.5 line spacing

% --- Graphics & Color ---
\usepackage{graphicx}
\usepackage[table]{xcolor}
\usepackage{float}

% --- Tables ---
\usepackage{longtable}
\usepackage{tabularx}
\usepackage{array}
\usepackage{multirow}
\usepackage{makecell}
\usepackage{colortbl}

% --- Lists ---
\usepackage{enumitem}

% --- Headers & footers ---
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% --- Heading styles (FPT requirements) ---
\usepackage{titlesec}

% Chapter heading: not used directly; we use \section as top level
% But report class needs chapter for TOC structure.
% We make chapter print nothing visible (content starts with \section).
\titleformat{\chapter}[display]
{\normalfont\fontsize{16}{20}\bfseries}
{}{0pt}{}
\titlespacing\*{\chapter}{0pt}{20pt}{15pt}

% Section = "1." --- 16pt bold
\titleformat{\section}[block]
{\normalfont\fontsize{16}{20}\bfseries}
{\thesection.}{0.5em}{}
\titlespacing\*{\section}{0pt}{18pt}{8pt}

% Subsection = "1.1." --- 14pt bold
\titleformat{\subsection}[block]
{\normalfont\fontsize{14}{17}\bfseries}
{\thesubsection.}{0.5em}{}
\titlespacing\*{\subsection}{0pt}{14pt}{6pt}
