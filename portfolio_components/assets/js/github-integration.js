// Function to extract title from README content
function extractTitleFromReadme(readme) {
    if (!readme) return null;

    // Helper function to clean title text
    function cleanTitle(title) {
        // Remove multiple spaces
        title = title.replace(/\s+/g, ' ');
        // Trim whitespace
        return title.trim();
    }

    // Look for the first heading (# Title) - more flexible regex to handle whitespace
    const titleMatch = readme.match(/^\s*#\s+([^\n]+)/m);
    if (titleMatch && titleMatch[1]) {
        // Clean and limit title length to prevent layout issues
        let title = cleanTitle(titleMatch[1]);
        // Only add ellipsis for very long titles
        if (title.length > 50) {
            title = title.substring(0, 47) + '...';
        }
        return title;
    }

    // If no match found with the first regex, try another pattern
    const altTitleMatch = readme.match(/^\s*#\s*(.+?)\s*$/m);
    if (altTitleMatch && altTitleMatch[1]) {
        // Clean and limit title length to prevent layout issues
        let title = cleanTitle(altTitleMatch[1]);
        if (title.length > 50) {
            title = title.substring(0, 47) + '...';
        }
        return title;
    }

    // If still no match, try to extract the first non-empty line
    const lines = readme.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && trimmedLine.startsWith('#')) {
            // Clean and limit title length to prevent layout issues
            let title = cleanTitle(trimmedLine.replace(/^#+\s*/, ''));
            if (title.length > 50) {
                title = title.substring(0, 47) + '...';
            }
            return title;
        }
    }

    return null;
}

// Function to determine languages for a project based on name and README
function determineProjectLanguages(projectName, readme) {
    const languages = [];

    // Extract languages from project name
    if (projectName.includes('JAVA') || projectName.includes('Java')) languages.push('Java');
    if (projectName.includes('C++') || projectName.includes('CPP')) languages.push('C++');
    if (projectName.includes('Python')) languages.push('Python');
    if (projectName.includes('JavaScript') || projectName.includes('JS')) languages.push('JavaScript');

    // Extract languages from README content
    if (readme) {
        // Look for language mentions in any section of the README
        const commonLanguages = [
            { name: 'Python', regex: /\bPython\b/i },
            { name: 'Java', regex: /\bJava\b/i },
            { name: 'C++', regex: /\bC\+\+\b/i },
            { name: 'JavaScript', regex: /\bJavaScript\b/i },
            { name: 'TypeScript', regex: /\bTypeScript\b/i },
            { name: 'Go', regex: /\bGo\b|\bGolang\b/i },
            { name: 'Ruby', regex: /\bRuby\b/i },
            { name: 'PHP', regex: /\bPHP\b/i },
            { name: 'C#', regex: /\bC#\b/i },
            { name: 'Swift', regex: /\bSwift\b/i },
            { name: 'Kotlin', regex: /\bKotlin\b/i },
            { name: 'Rust', regex: /\bRust\b/i },
            { name: 'Scala', regex: /\bScala\b/i },
            { name: 'R', regex: /\bR\b/ }
        ];

        // Check for language mentions in the Technologies Used section first
        const techSection = readme.match(/## Technologies Used[\s\S]*?(?=##|$)/i);
        if (techSection) {
            const techContent = techSection[0];

            // Check for common languages in the tech section
            commonLanguages.forEach(lang => {
                if (lang.regex.test(techContent) && !languages.includes(lang.name)) {
                    languages.push(lang.name);
                }
            });
        }

        // If no languages found in tech section, check the entire README
        if (languages.length === 0) {
            commonLanguages.forEach(lang => {
                if (lang.regex.test(readme) && !languages.includes(lang.name)) {
                    languages.push(lang.name);
                }
            });
        }

        // Look for bullet points that might indicate languages
        const bulletPoints = readme.match(/[-*]\s+([^\n]+)/g) || [];
        bulletPoints.forEach(point => {
            commonLanguages.forEach(lang => {
                if (lang.regex.test(point) && !languages.includes(lang.name)) {
                    languages.push(lang.name);
                }
            });
        });
    }

    // Add default language if none found
    if (languages.length === 0) {
        // Special case for essay-classification-model-python
        if (projectName === 'essay-classification-model-python') {
            languages.push('Python');
        }
        // Check for keywords in project name and readme
        else if (projectName.toUpperCase().includes('JAVA')) {
            languages.push('Java');
        } else if (projectName.toUpperCase().includes('ALGORITHM') ||
            projectName.toUpperCase().includes('RUNTIME') ||
            projectName.toUpperCase().includes('ANALYSIS')) {
            // Extract title to check for Java mentions
            const titleMatch = readme ? readme.match(/^\s*#\s+([^\n]+)/m) : null;
            const title = titleMatch ? titleMatch[1].trim() : '';

            if (title.toUpperCase().includes('JAVA')) {
                languages.push('Java');
            } else {
                languages.push('Algorithm');
            }
        } else if (projectName.toLowerCase().includes('ai') ||
            projectName.toLowerCase().includes('machine learning') ||
            (readme && readme.toLowerCase().includes('machine learning'))) {
            languages.push('Python');
        } else {
            // Use a more appropriate default language based on the project name
            if (projectName.toLowerCase().includes('python')) {
                languages.push('Python');
            } else if (projectName.toLowerCase().includes('java')) {
                languages.push('Java');
            } else if (projectName.toLowerCase().includes('js') || projectName.toLowerCase().includes('javascript')) {
                languages.push('JavaScript');
            } else {
                languages.push('Programming'); // Generic programming tag instead of "Multiple"
            }
        }
    }

    return languages;
}

// Function to determine technologies for a project based on README
function determineProjectTechnologies(readme) {
    const technologies = [];

    if (readme) {
        // Define common frameworks and libraries with regex patterns
        const commonTechs = [
            // Machine Learning & AI
            { name: 'TensorFlow', regex: /\bTensorFlow\b/i },
            { name: 'PyTorch', regex: /\bPyTorch\b/i },
            { name: 'Scikit-learn', regex: /\bScikit-learn\b|\bsklearn\b/i },
            { name: 'Keras', regex: /\bKeras\b/i },
            { name: 'Hugging Face', regex: /\bHugging Face\b|\bTransformers\b/i },
            { name: 'NLTK', regex: /\bNLTK\b/i },
            { name: 'SpaCy', regex: /\bSpaCy\b/i },
            { name: 'OpenAI', regex: /\bOpenAI\b|\bGPT\b/i },
            { name: 'LangChain', regex: /\bLangChain\b/i },
            { name: 'Llama', regex: /\bLlama\b/i },

            // Data Science
            { name: 'Pandas', regex: /\bPandas\b/i },
            { name: 'NumPy', regex: /\bNumPy\b/i },
            { name: 'Matplotlib', regex: /\bMatplotlib\b/i },
            { name: 'Seaborn', regex: /\bSeaborn\b/i },
            { name: 'Plotly', regex: /\bPlotly\b/i },
            { name: 'Jupyter', regex: /\bJupyter\b/i },
            { name: 'Data Analysis', regex: /\bData Analysis\b/i },
            { name: 'Data Visualization', regex: /\bData Visualization\b/i },
            { name: 'Statistical Analysis', regex: /\bStatistical Analysis\b/i },

            // Web Development
            { name: 'React', regex: /\bReact\b/i },
            { name: 'Angular', regex: /\bAngular\b/i },
            { name: 'Vue.js', regex: /\bVue\b/i },
            { name: 'Next.js', regex: /\bNext\.js\b/i },
            { name: 'Svelte', regex: /\bSvelte\b/i },
            { name: 'Django', regex: /\bDjango\b/i },
            { name: 'Flask', regex: /\bFlask\b/i },
            { name: 'FastAPI', regex: /\bFastAPI\b/i },
            { name: 'Spring', regex: /\bSpring\b/i },
            { name: 'Node.js', regex: /\bNode\.js\b|\bNodeJS\b/i },
            { name: 'Express', regex: /\bExpress\b/i },
            { name: 'HTML/CSS', regex: /\bHTML\b|\bCSS\b/i },
            { name: 'JavaScript', regex: /\bJavaScript\b|\bJS\b/i },
            { name: 'TypeScript', regex: /\bTypeScript\b|\bTS\b/i },
            { name: 'REST API', regex: /\bREST\b|\bRESTful\b|\bAPI\b/i },
            { name: 'GraphQL', regex: /\bGraphQL\b/i },

            // Databases
            { name: 'MongoDB', regex: /\bMongoDB\b/i },
            { name: 'MySQL', regex: /\bMySQL\b/i },
            { name: 'PostgreSQL', regex: /\bPostgreSQL\b/i },
            { name: 'SQLite', regex: /\bSQLite\b/i },
            { name: 'Redis', regex: /\bRedis\b/i },
            { name: 'Elasticsearch', regex: /\bElasticsearch\b/i },
            { name: 'SQL', regex: /\bSQL\b/i },
            { name: 'NoSQL', regex: /\bNoSQL\b/i },

            // DevOps & Cloud
            { name: 'Docker', regex: /\bDocker\b/i },
            { name: 'Kubernetes', regex: /\bKubernetes\b|\bK8s\b/i },
            { name: 'CI/CD', regex: /\bCI\/CD\b|\bContinuous Integration\b|\bContinuous Deployment\b/i },
            { name: 'AWS', regex: /\bAWS\b|\bAmazon Web Services\b/i },
            { name: 'Azure', regex: /\bAzure\b|\bMicrosoft Azure\b/i },
            { name: 'Google Cloud', regex: /\bGCP\b|\bGoogle Cloud\b/i },
            { name: 'Terraform', regex: /\bTerraform\b/i },
            { name: 'Ansible', regex: /\bAnsible\b/i },
            { name: 'Jenkins', regex: /\bJenkins\b/i },
            { name: 'GitHub Actions', regex: /\bGitHub Actions\b/i },

            // Domain-specific
            { name: 'Machine Learning', regex: /\bMachine Learning\b|\bML\b/i },
            { name: 'Deep Learning', regex: /\bDeep Learning\b|\bDL\b/i },
            { name: 'Natural Language Processing', regex: /\bNLP\b|\bNatural Language Processing\b/i },
            { name: 'Computer Vision', regex: /\bComputer Vision\b|\bCV\b/i },
            { name: 'Reinforcement Learning', regex: /\bReinforcement Learning\b|\bRL\b/i },
            { name: 'Data Science', regex: /\bData Science\b/i },
            { name: 'Web Development', regex: /\bWeb Development\b|\bWeb Dev\b/i },
            { name: 'Mobile Development', regex: /\bMobile Development\b|\bMobile App\b/i },
            { name: 'Robotics', regex: /\bRobotics\b/i },
            { name: 'Blockchain', regex: /\bBlockchain\b/i },
            { name: 'Cryptography', regex: /\bCryptography\b|\bCrypto\b/i },
            { name: 'Financial APIs', regex: /\bFinancial API\b|\bFinance API\b/i },
            { name: 'Trading', regex: /\bTrading\b|\bAlgorithmic Trading\b/i },
            { name: 'Quantitative Finance', regex: /\bQuantitative Finance\b|\bQuant\b/i },

            // Computer Science
            { name: 'Algorithms', regex: /\bAlgorithm\b/i },
            { name: 'Data Structures', regex: /\bData Structures\b/i },
            { name: 'Sorting Algorithms', regex: /\bSorting Algorithm\b/i },
            { name: 'Runtime Analysis', regex: /\bRuntime Analysis\b|\bTime Complexity\b/i },
            { name: 'Multi-threading', regex: /\bMulti-thread\b|\bMultithreaded\b|\bParallel\b/i },
            { name: 'Distributed Systems', regex: /\bDistributed Systems\b|\bDistributed Computing\b/i },
            { name: 'System Design', regex: /\bSystem Design\b|\bArchitecture\b/i },
            { name: 'Object-Oriented Programming', regex: /\bOOP\b|\bObject-Oriented\b/i },
            { name: 'Functional Programming', regex: /\bFunctional Programming\b/i },
            { name: 'Design Patterns', regex: /\bDesign Patterns\b/i }
        ];

        // First check for a Technologies Used section
        const techSection = readme.match(/## [Tt]echnologies [Uu]sed[\s\S]*?(?=##|$)/i) ||
                           readme.match(/## [Tt]ools [Aa]nd [Tt]echnologies[\s\S]*?(?=##|$)/i) ||
                           readme.match(/## [Tt]echnologies[\s\S]*?(?=##|$)/i);

        if (techSection) {
            const techContent = techSection[0];

            // Check for common frameworks and libraries in tech section
            commonTechs.forEach(tech => {
                if (tech.regex.test(techContent)) {
                    technologies.push(tech.name);
                }
            });
        }

        // If few or no technologies found in tech section, check the entire README
        if (technologies.length < 2) {
            commonTechs.forEach(tech => {
                if (tech.regex.test(readme) && !technologies.includes(tech.name)) {
                    technologies.push(tech.name);
                }
            });
        }

        // Look for bullet points that might indicate technologies
        const bulletPoints = readme.match(/[-*]\s+([^\n]+)/g) || [];
        bulletPoints.forEach(point => {
            commonTechs.forEach(tech => {
                if (tech.regex.test(point) && !technologies.includes(tech.name)) {
                    technologies.push(tech.name);
                }
            });
        });

        // Extract title to check for algorithm-related projects
        const titleMatch = readme.match(/^\s*#\s+([^\n]+)/m);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Add specific technologies based on title patterns
        if (title.toLowerCase().includes('algorithm') ||
            title.toLowerCase().includes('runtime') ||
            title.toLowerCase().includes('analysis')) {
            if (!technologies.includes('Algorithms')) {
                technologies.push('Algorithms');
            }
            if (title.toLowerCase().includes('sorting') && !technologies.includes('Sorting Algorithms')) {
                technologies.push('Sorting Algorithms');
            }
            if (title.toLowerCase().includes('runtime') && !technologies.includes('Runtime Analysis')) {
                technologies.push('Runtime Analysis');
            }
        }
    }

    // Add default technologies based on project name and languages if we don't have enough
    if (technologies.length < 3) {
        // Extract title to check for keywords
        const titleMatch = readme.match(/^\s*#\s+([^\n]+)/m);
        const title = titleMatch ? titleMatch[1].trim().toLowerCase() : '';

        // Check for AI/ML related projects
        if (title.includes('ai') || title.includes('machine learning') || title.includes('neural') ||
            title.includes('deep learning') || title.includes('nlp')) {
            if (!technologies.includes('Machine Learning')) technologies.push('Machine Learning');
            if (!technologies.includes('Data Science')) technologies.push('Data Science');
            if (!technologies.includes('Python')) technologies.push('Python');
        }

        // Check for web development projects
        else if (title.includes('web') || title.includes('frontend') || title.includes('backend') ||
                 title.includes('app') || title.includes('api')) {
            if (!technologies.includes('Web Development')) technologies.push('Web Development');
            if (!technologies.includes('REST API')) technologies.push('REST API');
            if (!technologies.includes('JavaScript')) technologies.push('JavaScript');
        }

        // Check for data analysis projects
        else if (title.includes('data') || title.includes('analysis') || title.includes('visualization')) {
            if (!technologies.includes('Data Analysis')) technologies.push('Data Analysis');
            if (!technologies.includes('Data Visualization')) technologies.push('Data Visualization');
            if (!technologies.includes('Statistical Analysis')) technologies.push('Statistical Analysis');
        }

        // Check for algorithm/CS projects
        else if (title.includes('algorithm') || title.includes('data structure') ||
                 title.includes('implementation')) {
            if (!technologies.includes('Algorithms')) technologies.push('Algorithms');
            if (!technologies.includes('Data Structures')) technologies.push('Data Structures');
            if (!technologies.includes('Computer Science')) technologies.push('Computer Science');
        }

        // Default tags for any project
        else {
            if (!technologies.includes('Software Development')) technologies.push('Software Development');
            if (!technologies.includes('Programming')) technologies.push('Programming');
            if (!technologies.includes('Computer Science')) technologies.push('Computer Science');
        }
    }

    // Limit to a reasonable number of technologies
    if (technologies.length > 5) {
        technologies.splice(5);
    }

    return technologies;
}

// Simple function to handle forked repositories
function handleForkedRepos() {
    console.log('Handling forked repositories...');
    // We keep ai-hedge-fund and exclude other forks
    return;
}

async function fetchGitHubProjects() {
    try {
        // Create a cache key based on the current date (refreshes daily)
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `github_projects_${today}`;

        // Check if we have cached data
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            console.log('Using cached GitHub data');
            return JSON.parse(cachedData);
        }

        // Handle forked repositories
        handleForkedRepos();

        console.log('Fetching fresh data from GitHub API');

        // Fetch all repositories
        const reposResponse = await fetch('https://api.github.com/users/TFelbor/repos');
        if (!reposResponse.ok) {
            throw new Error(`GitHub API error: ${reposResponse.status}`);
        }

        const repos = await reposResponse.json();

        // Filter out repositories to exclude
        const filteredRepos = repos.filter(repo => {
            // Exclude user config repo, portfolio website, and welcome repos
            if (repo.name === 'TFelbor' ||
                repo.name === 'portfolio-website' ||
                repo.name.toLowerCase().includes('welcome')) {
                return false;
            }

            // Exclude forked repositories except ai-hedge-fund
            if (repo.fork && repo.name !== 'ai-hedge-fund') {
                console.log(`Excluding forked repository: ${repo.name}`);
                return false;
            }

            return true;
        });

        // Sort repositories by last updated
        filteredRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Get the most recent repository
        const mostRecent = filteredRepos[0];

        // Fetch README for most recent project to get title and languages
        const mostRecentReadme = await fetchReadmeOnDemand(mostRecent.name);
        const mostRecentTitle = extractTitleFromReadme(mostRecentReadme) || mostRecent.name;
        const mostRecentLanguages = determineProjectLanguages(mostRecent.name, mostRecentReadme);
        const mostRecentTechnologies = determineProjectTechnologies(mostRecentReadme);

        // Add title and languages to most recent project
        mostRecent.readmeTitle = mostRecentTitle;
        mostRecent.languages = mostRecentLanguages;
        mostRecent.technologies = mostRecentTechnologies;

        // Portfolio repository has been deleted, so we'll just use all repositories
        let portfolioProjects = []; // Keep this empty array for backward compatibility

        // Use all filtered repositories as projects
        const otherProjects = filteredRepos;

        // Add title and languages to other projects
        for (const project of otherProjects) {
            const readme = await fetchReadmeOnDemand(project.name);
            project.readmeTitle = extractTitleFromReadme(readme) || project.name;
            project.languages = determineProjectLanguages(project.name, readme);
            project.technologies = determineProjectTechnologies(readme);
        }

        // Prepare the result
        const result = {
            mostRecent,
            portfolioProjects,
            otherProjects
        };

        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify(result));

        return result;
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);

        // Fallback to hardcoded data if API fails
        return getFallbackProjectData();
    }
}

// Fallback data in case the GitHub API fails
function getFallbackProjectData() {
    console.log('Using fallback project data');

    return {
        "mostRecent": {
            "name": "essay-classification-model-python",
            "html_url": "https://github.com/TFelbor/essay-classification-model-python",
            "description": "Machine learning model for classifying essays by topic and quality",
            "readmeTitle": "Essay Classification Model",
            "languages": ["Python"],
            "technologies": ["Machine Learning", "NLP", "Data Analysis"]
        },
        "portfolioProjects": [], // Empty array since Portfolio repository is deleted
        "otherProjects": [
            {
                "name": "essay-classification-model-python",
                "html_url": "https://github.com/TFelbor/essay-classification-model-python",
                "description": "Machine learning model for classifying essays by topic and quality",
                "readmeTitle": "Essay Classification Model",
                "languages": ["Python"],
                "technologies": ["Machine Learning", "NLP", "Data Analysis"]
            },
            {
                "name": "ai-asset-eval-team",
                "html_url": "https://github.com/TFelbor/ai-asset-eval-team",
                "description": "AI-powered asset evaluation tool",
                "readmeTitle": "AI Asset Evaluation Team",
                "languages": ["Python"],
                "technologies": ["TensorFlow", "PyTorch", "Financial APIs", "Machine Learning", "Asset Evaluation"]
            },
            {
                "name": "asset-eval-team",
                "html_url": "https://github.com/TFelbor/asset-eval-team",
                "description": "Team-based asset evaluation platform",
                "readmeTitle": "Asset Evaluation Team",
                "languages": ["Python", "JavaScript"],
                "technologies": ["Machine Learning", "Financial Analysis", "Team Collaboration", "Asset Evaluation"]
            },
            {
                "name": "python-trading-training",
                "html_url": "https://github.com/TFelbor/python-trading-training",
                "description": "Python scripts for algorithmic trading and backtesting",
                "readmeTitle": "Python Trading Training",
                "languages": ["Python"],
                "technologies": ["Pandas", "NumPy", "Matplotlib", "Trading", "Financial Analysis"]
            },

            {
                "name": "ai-library",
                "html_url": "https://github.com/TFelbor/ai-library",
                "description": "Comprehensive library of AI algorithms and tools",
                "readmeTitle": "AI Library",
                "languages": ["Python"],
                "technologies": ["TensorFlow", "PyTorch", "Hugging Face", "Machine Learning", "Deep Learning"]
            },
            {
                "name": "ai-financial-agent",
                "html_url": "https://github.com/TFelbor/ai-financial-agent",
                "description": "AI agent for financial analysis and decision making",
                "readmeTitle": "AI Financial Agent",
                "languages": ["Python"],
                "technologies": ["Machine Learning", "Financial APIs", "Natural Language Processing", "Trading", "Decision Making"]
            }
        ]
    };
}

async function fetchReadmeOnDemand(repoName, branch = 'main') {
    try {
        // Create a cache key for this specific README
        const cacheKey = `github_readme_${repoName}_${branch}`;

        // Check if we have cached README content
        const cachedReadme = localStorage.getItem(cacheKey);
        if (cachedReadme) {
            console.log(`Using cached README for ${repoName}/${branch}`);
            return cachedReadme;
        }

        console.log(`Fetching README for ${repoName}/${branch}`);

        // Check if we have a fallback README first to avoid unnecessary network requests
        const fallbackReadme = getFallbackReadme(repoName);
        if (fallbackReadme) {
            console.log(`Using fallback README for ${repoName}`);
            // Cache the fallback README content
            localStorage.setItem(cacheKey, fallbackReadme);
            return fallbackReadme;
        }

        // For all repositories
        const url = `https://raw.githubusercontent.com/TFelbor/${repoName}/main/README.md`;

        try {
            const response = await fetch(url);

            if (response.ok) {
                const readme = await response.text();

                // Cache the README content
                localStorage.setItem(cacheKey, readme);

                return readme;
            } else {
                console.warn(`Failed to fetch README for ${repoName}/${branch}:`, response.status);
                // Fall back to hardcoded content if available, otherwise return a default message
                const defaultReadme = `# ${repoName.replace(/_/g, ' ')}\n\nNo README content available for this project.`;
                localStorage.setItem(cacheKey, defaultReadme);
                return defaultReadme;
            }
        } catch (fetchError) {
            console.error(`Network error fetching README for ${repoName}/${branch}:`, fetchError);
            const defaultReadme = `# ${repoName.replace(/_/g, ' ')}\n\nNo README content available for this project.`;
            localStorage.setItem(cacheKey, defaultReadme);
            return defaultReadme;
        }
    } catch (error) {
        console.error(`Error in fetchReadmeOnDemand for ${repoName}/${branch}:`, error);
        const defaultReadme = `# ${repoName.replace(/_/g, ' ')}\n\nError loading README content.`;
        return defaultReadme;
    }
}

// Fallback README content in case the GitHub API fails
function getFallbackReadme(repoName) {
    // Hardcoded README content as fallback
    const readmeContent = {
        "essay-classification-model-python": "# Essay Classification Model\n\nA machine learning model for classifying essays by topic and quality.\n\n## Features\n\n- Automated essay scoring\n- Topic classification\n- Quality assessment\n- Feedback generation\n- Batch processing capabilities\n\n## Technologies Used\n\n- Python\n- Natural Language Processing\n- Machine Learning\n- BERT and Transformer models\n- Scikit-learn\n- Pandas\n\n## Implementation Details\n\nThis project implements a sophisticated essay classification system that:\n\n- Preprocesses text data for analysis\n- Extracts meaningful features from essays\n- Applies transformer-based models for classification\n- Provides detailed scoring and feedback\n- Supports multiple classification criteria\n\n## Applications\n\nIdeal for:\n- Educational institutions\n- Online learning platforms\n- Writing assessment tools\n- Automated grading systems\n- Content quality evaluation",

        "A_Star_Algorithm_Robotics_JAVA_C++": "# A* Algorithm for Robotics\n\nThis project implements the A* pathfinding algorithm for robotics applications in both Java and C++.\n\n## Features\n\n- Efficient pathfinding for robot navigation\n- Obstacle avoidance\n- Optimized for real-time applications\n- Cross-platform implementation\n\n## Technologies Used\n\n- Java\n- C++\n- Robotics frameworks\n\n## Implementation Details\n\nThe A* algorithm is implemented with the following components:\n\n- Priority queue for efficient node selection\n- Heuristic function for distance estimation\n- Path reconstruction from goal to start\n- Visualization tools for debugging\n\n## Performance\n\nThe implementation has been optimized for performance and memory usage, making it suitable for real-time robotics applications. Benchmarks show it outperforms traditional Dijkstra's algorithm by 40-60% in typical scenarios.",

        "Neural_Network_From_Scratch": "# Neural Network From Scratch\n\nA complete implementation of a neural network without using any machine learning libraries.\n\n## Features\n\n- Fully connected feedforward neural network\n- Backpropagation algorithm\n- Various activation functions (ReLU, Sigmoid, Tanh)\n- Customizable network architecture\n- Batch training support\n\n## Technologies Used\n\n- Python\n- NumPy (for matrix operations only)\n- Matplotlib (for visualization)\n\n## Implementation Details\n\nThis project implements a neural network from first principles, including:\n\n- Forward propagation\n- Backpropagation for gradient calculation\n- Gradient descent optimization\n- Weight initialization techniques\n- Learning rate scheduling\n\n## Example Results\n\nThe network has been tested on several standard datasets:\n\n- MNIST (97.8% accuracy)\n- XOR problem (100% accuracy)\n- Simple regression tasks (low MSE)\n\nThe implementation provides insights into how neural networks function at a fundamental level.",

        "Blockchain_Implementation": "# Blockchain Implementation\n\nA simple but complete blockchain implementation with proof-of-work consensus.\n\n## Features\n\n- Blockchain data structure\n- Proof-of-work mining\n- Transaction validation\n- Cryptographic signing\n- Distributed consensus\n\n## Technologies Used\n\n- Python\n- Cryptography libraries\n- Flask (for API)\n- P2P networking\n\n## Implementation Details\n\nThis blockchain implementation includes:\n\n- Block structure with transactions, timestamp, and hash\n- Mining algorithm with adjustable difficulty\n- Merkle tree for transaction verification\n- Public/private key cryptography for transaction signing\n- Simple P2P network for node communication\n\n## Use Cases\n\nWhile this is an educational implementation, it demonstrates the core concepts behind cryptocurrencies and can be used for:\n\n- Learning blockchain fundamentals\n- Prototyping blockchain applications\n- Testing consensus algorithms",

        "Image_Processing_Algorithms": "# Image Processing Algorithms\n\nA collection of image processing algorithms implemented from scratch.\n\n## Algorithms Implemented\n\n- Edge detection (Sobel, Canny)\n- Image filtering (Gaussian, Median)\n- Histogram equalization\n- Image segmentation\n- Feature extraction\n- Morphological operations\n\n## Technologies Used\n\n- Python\n- NumPy\n- OpenCV (for comparison only)\n- Matplotlib (for visualization)\n\n## Implementation Details\n\nEach algorithm is implemented without relying on existing image processing libraries, providing a deep understanding of how these algorithms work. The implementations include:\n\n- Mathematical foundations\n- Optimization techniques\n- Performance comparisons\n- Visual examples\n\n## Applications\n\nThese algorithms can be applied to various image processing tasks:\n\n- Medical image analysis\n- Computer vision systems\n- Image enhancement\n- Object detection\n- Pattern recognition",

        "Data_Structures_And_Algorithms": "# Data Structures and Algorithms\n\nComprehensive implementation of fundamental data structures and algorithms.\n\n## Data Structures\n\n- Arrays and Linked Lists\n- Stacks and Queues\n- Trees (Binary, AVL, Red-Black)\n- Graphs (Directed, Undirected)\n- Hash Tables\n- Heaps\n\n## Algorithms\n\n- Sorting (Quick, Merge, Heap, Bubble)\n- Searching (Binary, Depth-First, Breadth-First)\n- Dynamic Programming\n- Greedy Algorithms\n- Graph Algorithms (Dijkstra, Kruskal, Prim)\n\n## Technologies Used\n\n- Java\n- C++\n- Python\n\n## Implementation Details\n\nEach data structure and algorithm is implemented with:\n\n- Detailed comments explaining the approach\n- Time and space complexity analysis\n- Test cases for verification\n- Performance benchmarks\n\n## Educational Value\n\nThis project serves as a comprehensive reference for computer science fundamentals, suitable for:\n\n- Interview preparation\n- Algorithm study\n- Teaching materials\n- Performance comparisons",

        "ai-asset-eval-team": "# AI Asset Evaluation Team\n\nAn AI-powered tool for evaluating digital and physical assets.\n\n## Features\n\n- Automated asset valuation\n- Market trend analysis\n- Risk assessment\n- Portfolio optimization\n\n## Technologies Used\n\n- Python\n- TensorFlow\n- PyTorch\n- Financial APIs",

        "asset-eval-team": "# Asset Evaluation Team\n\nA collaborative platform for team-based asset evaluation and analysis.\n\n## Features\n\n- Team collaboration tools\n- Asset valuation workflows\n- Market analysis dashboards\n- Performance tracking\n- Report generation\n\n## Technologies Used\n\n- Python\n- JavaScript\n- React\n- Flask\n- Financial APIs\n- Machine Learning\n\n## Implementation Details\n\nThis platform enables teams to collaborate on asset evaluation with:\n\n- Real-time data sharing\n- Collaborative analysis tools\n- Version control for evaluations\n- Automated report generation\n- Performance metrics tracking\n\n## Applications\n\nIdeal for:\n\n- Investment teams\n- Financial analysts\n- Asset management firms\n- Portfolio managers\n- Risk assessment teams",

        "python-trading-training": "# Python Trading Training\n\nA collection of Python scripts for algorithmic trading and backtesting.\n\n## Features\n\n- Backtesting framework\n- Strategy implementation\n- Market data analysis\n- Performance metrics\n\n## Technologies Used\n\n- Python\n- Pandas\n- NumPy\n- Matplotlib",

        "ai-library": "# AI Library\n\nA comprehensive library of AI algorithms and tools.\n\n## Features\n\n- Machine learning algorithms\n- Deep learning models\n- Natural language processing tools\n- Computer vision utilities\n\n## Technologies Used\n\n- Python\n- TensorFlow\n- PyTorch\n- Hugging Face Transformers",

        "ai-financial-agent": "# AI Financial Agent\n\nAn AI agent for financial analysis and decision making.\n\n## Features\n\n- Market analysis\n- Investment recommendations\n- Risk assessment\n- Portfolio management\n\n## Technologies Used\n\n- Python\n- Machine Learning\n- Financial APIs\n- Natural Language Processing",

        "ai-hedge-fund": "# AI Hedge Fund\n\nAI-powered hedge fund simulation and strategy testing.\n\n## Features\n\n- Market simulation\n- Strategy backtesting\n- Risk management\n- Performance analytics\n\n## Technologies Used\n\n- Python\n- Machine Learning\n- Financial APIs\n- Statistical Analysis",

        "DeepSeek-V3": "# DeepSeek V3\n\nAdvanced deep learning framework for complex tasks.\n\n## Features\n\n- State-of-the-art model architectures\n- Transfer learning capabilities\n- Multi-modal learning\n- Distributed training\n\n## Technologies Used\n\n- Python\n- PyTorch\n- CUDA\n- Distributed Computing"
    };

    // For all repositories, use the repo name as the key
    return readmeContent[repoName] || null;
}
