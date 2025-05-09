// Function to clear GitHub cache - no longer uses localStorage
function clearGitHubCache() {
    console.log('GitHub cache clearing function called - no localStorage caching is used');
    // This function is kept for backward compatibility but no longer stores data in localStorage

    // Clear browser cache for GitHub URLs
    clearBrowserCache();
}

// Clear browser cache on initial load to ensure fresh data
// Use a timeout to ensure this doesn't block page rendering
setTimeout(clearBrowserCache, 100);

// Function to format repository name for display
function formatRepoNameForDisplay(repoName) {
    if (!repoName) return '';

    // Replace hyphens and underscores with spaces
    let formattedName = repoName.replace(/[-_]/g, ' ');

    // Convert to uppercase
    formattedName = formattedName.toUpperCase();

    return formattedName;
}

// Function to generate a cache-busting timestamp
function clearBrowserCache() {
    console.log('Clearing browser cache...');

    // Try to clear browser cache for GitHub URLs if available
    // But don't rely on this as it may cause CORS issues
    try {
        if (window.caches) {
            console.log('Attempting to clear browser cache API...');
            // We'll try to clear caches but won't wait for it to complete
            // This avoids blocking the main thread and potential CORS issues
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        console.log(`Clearing cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                console.log('Browser caches cleared');
            }).catch(err => {
                console.error('Error clearing browser caches:', err);
            });
        }
    } catch (e) {
        console.log('Browser cache API not available or error:', e);
    }

    // Generate a unique timestamp for cache-busting
    const timestamp = new Date().getTime();
    console.log(`Cache-busting timestamp: ${timestamp}`);

    return timestamp;
}

// Function to clear all GitHub-related cache (now just clears browser cache)
function clearAllGitHubCache() {
    console.log('Clearing all GitHub-related cache...');

    // No longer using localStorage, just clear browser cache
    return clearBrowserCache();
}

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

// Function to extract content under the first H1 heading (before any H2 heading)
function extractContentUnderFirstHeading(readme) {
    if (!readme) return null;

    // Helper function to clean and format content
    function cleanContent(content) {
        // Remove multiple spaces and trim
        content = content.replace(/\s+/g, ' ').trim();

        // Limit length for display purposes
        if (content.length > 250) {
            content = content.substring(0, 247) + '...';
        }

        return content;
    }

    // Find the position of the first H1 heading
    const h1Match = readme.match(/^\s*#\s+([^\n]+)/m);
    if (!h1Match) return null;

    // Get the index where the H1 heading ends
    const h1EndIndex = h1Match.index + h1Match[0].length;

    // Find the position of the next heading (H2 or another H1)
    const nextHeadingMatch = readme.substring(h1EndIndex).match(/^\s*#{1,2}\s+/m);

    // Extract the content between the first H1 and the next heading
    let content;
    if (nextHeadingMatch) {
        content = readme.substring(h1EndIndex, h1EndIndex + nextHeadingMatch.index).trim();
    } else {
        // If no next heading, take all content after the first H1
        content = readme.substring(h1EndIndex).trim();

        // Limit to a reasonable amount if there's no next heading
        const lines = content.split('\n');
        if (lines.length > 10) {
            content = lines.slice(0, 10).join('\n').trim();
        }
    }

    // Clean up the content
    content = content.replace(/^\s*[\r\n]+/g, ''); // Remove leading empty lines

    // If content is empty or just whitespace, return null
    if (!content || content.trim() === '') return null;

    return cleanContent(content);
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
        // Clear browser cache to ensure fresh data
        const cacheBuster = clearBrowserCache();
        console.log('Cleared browser cache to ensure fresh data');

        // Handle forked repositories
        handleForkedRepos();

        console.log('Fetching fresh data from GitHub API');

        // Fetch all repositories with increased per_page parameter to get all repos in one request
        // Add cache-busting parameter and cache control headers
        console.log(`Fetching GitHub repos with cache-buster: ${cacheBuster}`);

        // Use a simpler approach for GitHub API to avoid CORS issues
        // Only add the cache-busting parameter in the URL
        const reposResponse = await fetch(`https://api.github.com/users/TFelbor/repos?per_page=100&timestamp=${cacheBuster}`, {
            method: 'GET',
            mode: 'cors', // This is important for cross-origin requests
            cache: 'no-store'
            // Don't add custom headers that trigger preflight requests
        });
        if (!reposResponse.ok) {
            throw new Error(`GitHub API error: ${reposResponse.status}`);
        }

        const repos = await reposResponse.json();
        console.log(`Fetched ${repos.length} repositories from GitHub API`);

        // Log all repository names for debugging
        console.log('All repositories:', repos.map(repo => repo.name));

        // Create a list of repositories to exclude
        const excludedRepos = [
            'TFelbor',                // User config repo
            'portfolio-website',      // Portfolio website repo
            'agno_library',           // Specified in requirements
            'AI_Resources',           // Specified in requirements
            'GPT_Me',                 // Specified in requirements
            'awesome-ai-agents',       // Specified in requirements
            'web-particle-simulator'
        ];

        // Create a list of repositories to ensure inclusion
        const ensureIncluded = [
            'timeo-java',
            'skio-java',
            'sorting-algs-runtime-analysis',
            'parser-java',
            'simple-uno-javafx',
            'simple-stock-tracking-app-javafx'
        ];

        // Filter out repositories to exclude
        const filteredRepos = repos.filter(repo => {
            // Always include repositories from the ensureIncluded list
            if (ensureIncluded.includes(repo.name)) {
                console.log(`Ensuring inclusion of repository: ${repo.name}`);
                return true;
            }

            // Check if repo name is in the excluded list
            if (excludedRepos.includes(repo.name)) {
                console.log(`Excluding repository: ${repo.name}`);
                return false;
            }

            // Exclude forked repositories except ai-hedge-fund
            if (repo.fork && repo.name !== 'ai-hedge-fund') {
                console.log(`Excluding forked repository: ${repo.name}`);
                return false;
            }

            return true;
        });

        console.log(`After filtering, ${filteredRepos.length} repositories remain`);
        console.log('Filtered repositories:', filteredRepos.map(repo => repo.name));

        // Sort repositories by last updated
        filteredRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Get the most recent repository
        const mostRecent = filteredRepos[0];
        console.log(`Most recent repository: ${mostRecent.name}`);

        // Fetch README for most recent project to get content and languages
        const mostRecentReadme = await fetchReadmeOnDemand(mostRecent.name);
        const mostRecentTitle = extractTitleFromReadme(mostRecentReadme) || mostRecent.name;
        const mostRecentContent = extractContentUnderFirstHeading(mostRecentReadme) || "No description available.";
        const mostRecentLanguages = determineProjectLanguages(mostRecent.name, mostRecentReadme);
        const mostRecentTechnologies = determineProjectTechnologies(mostRecentReadme);

        // Add title and languages to most recent project
        mostRecent.readmeTitle = mostRecentTitle;

        // For ai-asset-eval-team, always use the specific title from the About section
        if (mostRecent.name === "ai-asset-eval-team") {
            mostRecent.title = "A.I. Enhanced Finance Dashboard";
            mostRecent.description = mostRecentContent || "An AI-powered dashboard for comprehensive analysis of different financial securities including stocks, cryptocurrencies, REITs, and ETFs.";
        } else {
            // For other repositories, use the GitHub repository description (About section) as the project title
            // Fall back to README title or formatted repo name if no description
            mostRecent.title = mostRecent.description || mostRecentTitle || formatRepoNameForDisplay(mostRecent.name);

            // Always use content under first heading from README as the description
            // This ensures title and description are always different
            mostRecent.description = mostRecentContent || "No description available.";

            // If title and description are the same, modify the description to make it different
            if (mostRecent.title === mostRecent.description) {
                mostRecent.description = "Details: " + mostRecent.description;
            }
        }

        mostRecent.languages = mostRecentLanguages;
        mostRecent.technologies = mostRecentTechnologies;

        // Portfolio repository has been deleted, so we'll just use all repositories
        let portfolioProjects = []; // Keep this empty array for backward compatibility

        // Use all filtered repositories as projects
        const otherProjects = filteredRepos;

        // Add title and languages to other projects
        for (const project of otherProjects) {
            const readme = await fetchReadmeOnDemand(project.name);
            // Extract the README title and content
            const readmeTitle = extractTitleFromReadme(readme) || project.name;
            const readmeContent = extractContentUnderFirstHeading(readme) || "No description available.";

            // Store the README title for reference
            project.readmeTitle = readmeTitle;

            // For ai-asset-eval-team, always use the specific title from the About section
            if (project.name === "ai-asset-eval-team") {
                project.title = "A.I. Enhanced Finance Dashboard";
                project.description = readmeContent || "An AI-powered dashboard for comprehensive analysis of different financial securities including stocks, cryptocurrencies, REITs, and ETFs.";
            } else {
                // For other repositories, use the GitHub repository description (About section) as the project title
                // Fall back to README title or formatted repo name if no description
                project.title = project.description || readmeTitle || formatRepoNameForDisplay(project.name);

                // Always use content under first heading from README as the description
                // This ensures title and description are always different
                project.description = readmeContent || "No description available.";

                // If title and description are the same, modify the description to make it different
                if (project.title === project.description) {
                    project.description = "Details: " + project.description;
                }
            }


            // Set languages and technologies
            project.languages = determineProjectLanguages(project.name, readme);
            project.technologies = determineProjectTechnologies(readme);

            console.log(`Processed project ${project.name}:`);
            console.log(`  Title: ${project.title}`);
            console.log(`  Description: ${project.description}`);
        }

        // Prepare the result
        const result = {
            mostRecent,
            portfolioProjects,
            otherProjects
        };

        // Don't cache the result to ensure fresh data on each page load
        console.log('Using fresh GitHub data without caching');

        return result;
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);

        // Log more details about the error
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.warn('This is likely a CORS issue. The browser is blocking cross-origin requests from a local file.');
            console.warn('Try using a local server or GitHub Pages to serve the website.');
        }

        // Fallback to hardcoded data if API fails
        console.log('Using fallback project data');
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
            "title": "A machine learning model for classifying essays by topic and quality",
            "description": "A machine learning model for classifying essays by topic and quality.",
            "readmeTitle": "Essay Classification Model",
            "languages": ["Python"],
            "technologies": ["Machine Learning", "NLP", "Data Analysis"]
        },
        "otherProjects": [
            {
                "name": "essay-classification-model-python",
                "html_url": "https://github.com/TFelbor/essay-classification-model-python",
                "title": "A machine learning model for classifying essays by topic and quality",
                "description": "A machine learning model for classifying essays by topic and quality.",
                "readmeTitle": "Essay Classification Model",
                "languages": ["Python"],
                "technologies": ["Machine Learning", "NLP", "Data Analysis"]
            },
            {
                "name": "covid19-prediction-hmm-python",
                "html_url": "https://github.com/TFelbor/covid19-prediction-hmm-python",
                "title": "COVID-19 Case Prediction with Hidden Markov Models",
                "description": "This repository contains a Python implementation of a Hidden Markov Model (HMM) for analyzing and predicting COVID-19 case trends based on historical monthly data.",
                "readmeTitle": "CPSC444 : AI Project 2 - COVID-19 Case Prediction with Hidden Markov Models",
                "languages": ["Python"],
                "technologies": ["Machine Learning", "Statistical Modeling", "Data Analysis"]
            },
            {
                "name": "timeo-java",
                "html_url": "https://github.com/TFelbor/timeo-java",
                "title": "A Java application for solving time-based orienteering problems",
                "description": "A Java application for solving time-based orienteering problems.",
                "readmeTitle": "Time-Based Orienteering Solver",
                "languages": ["Java"],
                "technologies": ["Algorithms", "Path Finding", "Optimization"]
            },
            {
                "name": "skio-java",
                "html_url": "https://github.com/TFelbor/skio-java",
                "title": "A specialized path optimizer for ski orienteering competitions",
                "description": "A specialized path optimizer for ski orienteering competitions.",
                "readmeTitle": "Ski Orienteering Path Optimizer",
                "languages": ["Java"],
                "technologies": ["Algorithms", "Path Finding", "Optimization"]
            },
            {
                "name": "aStar-robotics-java-cpp",
                "html_url": "https://github.com/TFelbor/aStar-robotics-java-cpp",
                "title": "A* pathfinding algorithm for robotics applications",
                "description": "This project implements the A* pathfinding algorithm for robotics applications in both Java and C++.",
                "readmeTitle": "A* for Robotics",
                "languages": ["Java", "C++"],
                "technologies": ["Algorithms", "Robotics", "Path Finding"]
            },
            {
                "name": "act-cli-java",
                "html_url": "https://github.com/TFelbor/act-cli-java",
                "title": "Command-line interface tool implementing auto-completion using tree data structures",
                "description": "A command-line interface tool implementing auto-completion using tree data structures.",
                "readmeTitle": "Auto-Completion Tree",
                "languages": ["Java"],
                "technologies": ["Data Structures", "Algorithms", "CLI"]
            },
            {
                "name": "sorting-algs-runtime-analysis",
                "html_url": "https://github.com/TFelbor/sorting-algs-runtime-analysis",
                "title": "Analysis of various sorting algorithm runtimes",
                "description": "A comprehensive analysis of various sorting algorithm runtimes under different conditions.",
                "readmeTitle": "Sorting Algorithms Analysis",
                "languages": ["Java"],
                "technologies": ["Algorithms", "Runtime Analysis", "Data Structures"]
            },
            {
                "name": "parser-java",
                "html_url": "https://github.com/TFelbor/parser-java",
                "title": "Tool for generating parsing tables and implementing expression parsers",
                "description": "A tool for generating parsing tables and implementing expression parsers.",
                "readmeTitle": "Parsing Table Generator",
                "languages": ["Java"],
                "technologies": ["Compiler Design", "Parsing Algorithms", "Formal Languages"]
            },
            {
                "name": "simple-uno-javafx",
                "html_url": "https://github.com/TFelbor/simple-uno-javafx",
                "title": "JavaFX implementation of a simplified UNO card game",
                "description": "A JavaFX implementation of a simplified version of the UNO card game.",
                "readmeTitle": "Simplified UNO Game",
                "languages": ["Java"],
                "technologies": ["JavaFX", "Game Development", "UI Design"]
            },
            {
                "name": "simple-stock-tracking-app-javafx",
                "html_url": "https://github.com/TFelbor/simple-stock-tracking-app-javafx",
                "title": "A simple JavaFX application for tracking stocks and financial data",
                "description": "This application provides a user-friendly interface for tracking stocks and analyzing financial data with customizable views and real-time updates.",
                "readmeTitle": "Stock Tracking Application",
                "languages": ["Java"],
                "technologies": ["JavaFX", "Financial Data", "UI Design"]
            },
            {
                "name": "basic-gui-app-javafx",
                "html_url": "https://github.com/TFelbor/basic-gui-app-javafx",
                "title": "Basic GUI application built with JavaFX",
                "description": "A basic GUI application built with JavaFX demonstrating fundamental concepts.",
                "readmeTitle": "JavaFX GUI Application",
                "languages": ["Java"],
                "technologies": ["JavaFX", "GUI", "Desktop Application"]
            },
            {
                "name": "drl-td3-python",
                "html_url": "https://github.com/TFelbor/drl-td3-python",
                "title": "Implementation of the TD3 reinforcement learning algorithm",
                "description": "An implementation of the Twin Delayed Deep Deterministic Policy Gradient (TD3) algorithm for reinforcement learning.",
                "readmeTitle": "TD3 Reinforcement Learning",
                "languages": ["Python"],
                "technologies": ["Reinforcement Learning", "Deep Learning", "AI"]
            },
            {
                "name": "dijkstra-java",
                "html_url": "https://github.com/TFelbor/dijkstra-java",
                "title": "Java implementation of Dijkstra's shortest path algorithm",
                "description": "A Java implementation of Dijkstra's shortest path algorithm with visualizations.",
                "readmeTitle": "Dijkstra's Algorithm Implementation",
                "languages": ["Java"],
                "technologies": ["Algorithms", "Graph Theory", "Path Finding"]
            },
            {
                "name": "hangman-networked-java",
                "html_url": "https://github.com/TFelbor/hangman-networked-java",
                "title": "Client-server implementation of the Hangman game",
                "description": "A client-server implementation of the classic Hangman game.",
                "readmeTitle": "Networked Hangman Game",
                "languages": ["Java"],
                "technologies": ["Networking", "Game Development", "Client-Server"]
            },
            {
                "name": "hex-ai-cpu-java",
                "html_url": "https://github.com/TFelbor/hex-ai-cpu-java",
                "title": "Implementation of the Hex board game with AI opponents",
                "description": "An implementation of the Hex board game with AI opponents.",
                "readmeTitle": "Hex Game with AI",
                "languages": ["Java"],
                "technologies": ["AI", "Game Theory", "Search Algorithms"]
            },
            {
                "name": "leetCode-solutions",
                "html_url": "https://github.com/TFelbor/leetCode-solutions",
                "title": "Collection of solutions to LeetCode problems",
                "description": "A collection of solutions to LeetCode problems implemented as terminal applications.",
                "readmeTitle": "LeetCode Solutions",
                "languages": ["Python"],
                "technologies": ["Algorithms", "Data Structures", "Problem Solving"]
            },
            {
                "name": "ai-asset-eval-team",
                "html_url": "https://github.com/TFelbor/ai-asset-eval-team",
                "title": "AI Enhanced Finance Dashboard",
                "description": "An AI-powered dashboard for comprehensive analysis of different financial securities including stocks, cryptocurrencies, REITs, and ETFs.",
                "readmeTitle": "AI Asset Evaluation Team",
                "languages": ["Python"],
                "technologies": ["TensorFlow", "PyTorch", "Financial APIs", "Machine Learning", "Data Visualization"]
            },
            {
                "name": "asset-eval-team",
                "html_url": "https://github.com/TFelbor/asset-eval-team",
                "title": "Collaborative platform for team-based asset evaluation",
                "description": "A collaborative platform for team-based asset evaluation and analysis.",
                "readmeTitle": "Asset Evaluation Team",
                "languages": ["Python", "JavaScript"],
                "technologies": ["Machine Learning", "Financial Analysis", "Team Collaboration", "Asset Evaluation"]
            },
            {
                "name": "python-trading-training",
                "html_url": "https://github.com/TFelbor/python-trading-training",
                "title": "Python scripts for algorithmic trading and backtesting",
                "description": "A collection of Python scripts for algorithmic trading and backtesting.",
                "readmeTitle": "Python Trading Training",
                "languages": ["Python"],
                "technologies": ["Pandas", "NumPy", "Matplotlib", "Trading", "Financial Analysis"]
            },
            {
                "name": "ai-library",
                "html_url": "https://github.com/TFelbor/ai-library",
                "title": "Comprehensive library of AI algorithms and tools",
                "description": "A comprehensive library of AI algorithms and tools.",
                "readmeTitle": "AI Library",
                "languages": ["Python"],
                "technologies": ["TensorFlow", "PyTorch", "Hugging Face", "Machine Learning", "Deep Learning"]
            },
            {
                "name": "ai-financial-agent",
                "html_url": "https://github.com/TFelbor/ai-financial-agent",
                "title": "AI agent for financial analysis and decision making",
                "description": "An AI agent for financial analysis and decision making.",
                "readmeTitle": "AI Financial Agent",
                "languages": ["Python"],
                "technologies": ["Machine Learning", "Financial APIs", "Natural Language Processing", "Trading", "Decision Making"]
            },
            {
                "name": "ai-hedge-fund",
                "html_url": "https://github.com/TFelbor/ai-hedge-fund",
                "title": "AI-powered hedge fund simulation and strategy testing",
                "description": "AI-powered hedge fund simulation and strategy testing.",
                "readmeTitle": "AI Hedge Fund",
                "languages": ["Python"],
                "technologies": ["Machine Learning", "Financial APIs", "Trading", "Strategy Testing"]
            }
        ]
    };
}

async function fetchReadmeOnDemand(repoName, branch = 'main') {
    try {
        console.log(`Fetching README for ${repoName}/${branch}`);

        // Clear browser cache first
        clearBrowserCache();

        // Always try to fetch from GitHub first
        // Use the provided branch parameter instead of hardcoding 'main'
        const url = `https://raw.githubusercontent.com/TFelbor/${repoName}/${branch}/README.md`;
        console.log(`Fetching from URL: ${url}`);

        try {
            // Add a cache-busting parameter to prevent browser caching
            const cacheBuster = new Date().getTime() + Math.random().toString(36).substring(2, 15);
            console.log(`Fetching README with cache-buster: ${cacheBuster}`);

            // Use a simpler approach to avoid CORS issues
            // Only add the cache-busting parameter in the URL
            const response = await fetch(`${url}?timestamp=${cacheBuster}`, {
                method: 'GET',
                mode: 'cors', // This is important for cross-origin requests
                cache: 'no-store',
                redirect: 'follow' // Follow redirects automatically
                // Don't add custom headers that trigger preflight requests
            });

            if (response.ok) {
                console.log(`Successfully fetched README for ${repoName}/${branch}`);
                const readme = await response.text();
                return readme;
            } else {
                console.warn(`Failed to fetch README for ${repoName}/${branch}:`, response.status);

                // Try the master branch as a fallback if the specified branch failed
                if (branch !== 'master') {
                    console.log(`Trying master branch for ${repoName}`);
                    try {
                        // Generate a new cache buster for this request
                        const newCacheBuster = new Date().getTime() + Math.random().toString(36).substring(2, 15);
                        const masterUrl = `https://raw.githubusercontent.com/TFelbor/${repoName}/master/README.md?timestamp=${newCacheBuster}`;
                        const masterResponse = await fetch(masterUrl, {
                            method: 'GET',
                            mode: 'cors', // This is important for cross-origin requests
                            cache: 'no-store',
                            redirect: 'follow' // Follow redirects automatically
                            // Don't add custom headers that trigger preflight requests
                        });

                        if (masterResponse.ok) {
                            console.log(`Successfully fetched README from master branch for ${repoName}`);
                            const masterReadme = await masterResponse.text();
                            return masterReadme;
                        } else {
                            console.warn(`Failed to fetch README from master branch for ${repoName}:`, masterResponse.status);
                        }
                    } catch (masterFetchError) {
                        console.error(`Error fetching from master branch for ${repoName}:`, masterFetchError);
                    }
                }

                // If both main and master branches fail, check for fallback README
                console.log(`Checking for fallback README for ${repoName}`);
                const fallbackReadme = getFallbackReadme(repoName);
                if (fallbackReadme) {
                    console.log(`Using fallback README for ${repoName}`);
                    return fallbackReadme;
                } else {
                    console.log(`No fallback README found for ${repoName}`);
                }

                // If all else fails, return a default message
                const defaultReadme = `# ${repoName.replace(/_/g, ' ')}\n\nNo README content available for this project.`;
                return defaultReadme;
            }
        } catch (fetchError) {
            console.error(`Network error fetching README for ${repoName}/${branch}:`, fetchError);

            // Check for fallback README if fetch fails
            const fallbackReadme = getFallbackReadme(repoName);
            if (fallbackReadme) {
                console.log(`Using fallback README for ${repoName} after network error`);
                return fallbackReadme;
            }

            const defaultReadme = `# ${repoName.replace(/_/g, ' ')}\n\nNo README content available for this project.`;
            return defaultReadme;
        }
    } catch (error) {
        console.error(`Error in fetchReadmeOnDemand for ${repoName}/${branch}:`, error);

        // Check for fallback README if there's an error
        const fallbackReadme = getFallbackReadme(repoName);
        if (fallbackReadme) {
            console.log(`Using fallback README for ${repoName} after error`);
            return fallbackReadme;
        }

        const defaultReadme = `# ${repoName.replace(/_/g, ' ')}\n\nError loading README content.`;
        return defaultReadme;
    }
}

// Fallback README content in case the GitHub API fails
function getFallbackReadme(repoName) {
    console.log(`Looking for fallback README for repository: "${repoName}"`);

    // Hardcoded README content as fallback
    const readmeContent = {
        "essay-classification-model-python": "# Essay Classification Model\n\nA machine learning model for classifying essays by topic and quality.\n\n## Features\n\n- Automated essay scoring\n- Topic classification\n- Quality assessment\n- Feedback generation\n- Batch processing capabilities\n\n## Technologies Used\n\n- Python\n- Natural Language Processing\n- Machine Learning\n- BERT and Transformer models\n- Scikit-learn\n- Pandas\n\n## Implementation Details\n\nThis project implements a sophisticated essay classification system that:\n\n- Preprocesses text data for analysis\n- Extracts meaningful features from essays\n- Applies transformer-based models for classification\n- Provides detailed scoring and feedback\n- Supports multiple classification criteria\n\n## Applications\n\nIdeal for:\n- Educational institutions\n- Online learning platforms\n- Writing assessment tools\n- Automated grading systems\n- Content quality evaluation",

        "covid19-prediction-hmm-python": "# CPSC444 : AI Project 2 - COVID-19 Case Prediction with Hidden Markov Models\n\nThis repository contains a Python implementation of a Hidden Markov Model (HMM) for analyzing and predicting COVID-19 case trends based on historical monthly data.\n\n## Features\n\n- Time series analysis of COVID-19 data\n- Hidden state inference\n- Prediction of future case numbers\n- Model validation and testing\n\n## Technologies Used\n\n- Python\n- Statistical Modeling\n- Hidden Markov Models\n- Data Analysis\n- Visualization\n\n## Implementation Details\n\nThis project uses Hidden Markov Models to analyze COVID-19 case data and predict future trends based on hidden state transitions.",

        "timeo-java": "# Time-Based Orienteering Solver\n\nA Java application for solving time-based orienteering problems.\n\n## Features\n\n- Optimal path finding with time constraints\n- Multiple algorithm implementations\n- Performance benchmarking\n- Visualization of solutions\n\n## Technologies Used\n\n- Java\n- Algorithms\n- Path Finding\n- Optimization\n\n## Implementation Details\n\nThis solver implements various algorithms to find optimal paths in orienteering problems with time constraints.",

        "skio-java": "# Ski Orienteering Path Optimizer\n\nA specialized path optimizer for ski orienteering competitions.\n\n## Features\n\n- Terrain analysis\n- Optimal path calculation\n- Energy expenditure modeling\n- Weather condition integration\n\n## Technologies Used\n\n- Java\n- Algorithms\n- Path Finding\n- Optimization\n- Terrain Modeling\n\n## Implementation Details\n\nThis optimizer accounts for ski-specific factors like terrain, snow conditions, and energy expenditure to find optimal paths.",

        "aStar-robotics-java-cpp": "# A* for Robotics\n\nThis project implements the A* pathfinding algorithm for robotics applications in both Java and C++.\n\n## Features\n\n- Efficient pathfinding for robot navigation\n- Obstacle avoidance\n- Optimized for real-time applications\n- Cross-platform implementation\n\n## Technologies Used\n\n- Java\n- C++\n- Robotics frameworks\n\n## Implementation Details\n\nThe A* algorithm is implemented with the following components:\n\n- Priority queue for efficient node selection\n- Heuristic function for distance estimation\n- Path reconstruction from goal to start\n- Visualization tools for debugging\n\n## Performance\n\nThe implementation has been optimized for performance and memory usage, making it suitable for real-time robotics applications. Benchmarks show it outperforms traditional Dijkstra's algorithm by 40-60% in typical scenarios.",

        "act-cli-java": "# Auto-Completion Tree\n\nA command-line interface tool implementing auto-completion using tree data structures.\n\n## Features\n\n- Fast auto-completion suggestions\n- Custom dictionary support\n- Memory-efficient implementation\n- Command history tracking\n\n## Technologies Used\n\n- Java\n- Data Structures\n- CLI\n- Algorithms\n\n## Implementation Details\n\nThis project uses specialized tree data structures to provide efficient auto-completion functionality in command-line interfaces.",

        "sorting-algs-runtime-analysis": "# Sorting Algorithms Analysis\n\nA comprehensive analysis of various sorting algorithm runtimes under different conditions.\n\n## Features\n\n- Multiple sorting algorithm implementations\n- Performance benchmarking\n- Complexity analysis\n- Visualization of results\n\n## Technologies Used\n\n- Java\n- Algorithms\n- Runtime Analysis\n- Data Structures\n\n## Implementation Details\n\nThis project analyzes the performance characteristics of different sorting algorithms across various input sizes and distributions.",

        "basic-gui-app-javafx": "# JavaFX GUI Application\n\nA basic GUI application built with JavaFX demonstrating fundamental concepts.\n\n## Features\n\n- Modern UI components\n- Event handling\n- Layout management\n- Data binding\n\n## Technologies Used\n\n- Java\n- JavaFX\n- GUI\n- Desktop Application\n\n## Implementation Details\n\nThis application demonstrates core JavaFX concepts and provides a foundation for building more complex desktop applications.",

        "drl-td3-python": "# TD3 Reinforcement Learning\n\nAn implementation of the Twin Delayed Deep Deterministic Policy Gradient (TD3) algorithm for reinforcement learning.\n\n## Features\n\n- Continuous action space support\n- Twin Q-networks for reduced overestimation\n- Delayed policy updates\n- Target network smoothing\n\n## Technologies Used\n\n- Python\n- Reinforcement Learning\n- Deep Learning\n- PyTorch\n\n## Implementation Details\n\nThis project implements the TD3 algorithm, an advanced reinforcement learning approach that addresses key limitations in previous actor-critic methods.",

        "dijkstra-java": "# Dijkstra's Algorithm Implementation\n\nA Java implementation of Dijkstra's shortest path algorithm with visualizations.\n\n## Features\n\n- Efficient shortest path finding\n- Graph visualization\n- Multiple graph representations\n- Performance optimizations\n\n## Technologies Used\n\n- Java\n- Algorithms\n- Graph Theory\n- Data Structures\n\n## Implementation Details\n\nThis implementation includes priority queue optimizations and supports various graph representations for different use cases.",

        "hangman-networked-java": "# Networked Hangman Game\n\nA client-server implementation of the classic Hangman game.\n\n## Features\n\n- Multiplayer support\n- Client-server architecture\n- Custom word dictionaries\n- Game state synchronization\n\n## Technologies Used\n\n- Java\n- Networking\n- Multithreading\n- Game Development\n\n## Implementation Details\n\nThis project demonstrates network programming concepts through a multiplayer implementation of the Hangman game.",

        "hex-ai-cpu-java": "# Hex Game with AI\n\nAn implementation of the Hex board game with AI opponents.\n\n## Features\n\n- Complete Hex game rules\n- Multiple AI difficulty levels\n- Monte Carlo Tree Search implementation\n- Game state visualization\n\n## Technologies Used\n\n- Java\n- AI\n- Game Theory\n- Search Algorithms\n\n## Implementation Details\n\nThis project implements the Hex board game with various AI opponents using different search strategies.",

        "leetCode-solutions": "# LeetCode Solutions\n\nA collection of solutions to LeetCode problems implemented as terminal applications.\n\n## Features\n\n- Optimized algorithm implementations\n- Time and space complexity analysis\n- Test cases and examples\n- Command-line interfaces\n\n## Technologies Used\n\n- Python\n- Algorithms\n- Data Structures\n- Problem Solving\n\n## Implementation Details\n\nThis collection includes solutions to various LeetCode problems, with a focus on optimal algorithms and clear explanations.",

        "parser-java": "# Parsing Table Generator\n\nA tool for generating parsing tables and implementing expression parsers.\n\n## Features\n\n- Grammar specification\n- First and Follow set calculation\n- LL(1) parsing table generation\n- Syntax tree visualization\n\n## Technologies Used\n\n- Java\n- Compiler Design\n- Parsing Algorithms\n- Formal Languages\n\n## Implementation Details\n\nThis project implements parsing table generation algorithms and provides tools for building expression parsers.",

        "simple-uno-javafx": "# Simplified UNO Game\n\nA JavaFX implementation of a simplified version of the UNO card game.\n\n## Features\n\n- Core UNO game mechanics\n- Single and multiplayer modes\n- Custom card deck support\n- Game state visualization\n\n## Technologies Used\n\n- Java\n- JavaFX\n- Game Development\n- UI Design\n\n## Implementation Details\n\nThis project implements a simplified version of the UNO card game with a focus on clean architecture and user experience.",

        "simple-stock-tracking-app-javafx": "# Stock Tracking Application\n\nA simple JavaFX application for tracking stocks and financial data.\n\n## Features\n\n- Real-time stock data display\n- Portfolio tracking\n- Performance visualization\n- Customizable watchlists\n\n## Technologies Used\n\n- Java\n- JavaFX\n- Financial APIs\n- Data Visualization\n\n## Implementation Details\n\nThis application provides a user-friendly interface for tracking stocks and analyzing financial data with customizable views and real-time updates.",

        "ai-asset-eval-team": "# AI Asset Evaluation Team\n\nAn AI-powered dashboard for comprehensive analysis of different financial securities including stocks, cryptocurrencies, REITs, and ETFs.\n\n## Features\n\n- Comprehensive financial security analysis\n- Real-time market data integration\n- Advanced visualization tools\n- Risk assessment and portfolio optimization\n- Multi-asset class support\n\n## Technologies Used\n\n- Python\n- TensorFlow\n- PyTorch\n- Financial APIs\n- Data Visualization",

        "asset-eval-team": "# Asset Evaluation Team\n\nA collaborative platform for team-based asset evaluation and analysis.\n\n## Features\n\n- Team collaboration tools\n- Asset valuation workflows\n- Market analysis dashboards\n- Performance tracking\n- Report generation\n\n## Technologies Used\n\n- Python\n- JavaScript\n- React\n- Flask\n- Financial APIs\n- Machine Learning\n\n## Implementation Details\n\nThis platform enables teams to collaborate on asset evaluation with:\n\n- Real-time data sharing\n- Collaborative analysis tools\n- Version control for evaluations\n- Automated report generation\n- Performance metrics tracking\n\n## Applications\n\nIdeal for:\n\n- Investment teams\n- Financial analysts\n- Asset management firms\n- Portfolio managers\n- Risk assessment teams",

        "python-trading-training": "# Python Trading Training\n\nA collection of Python scripts for algorithmic trading and backtesting.\n\n## Features\n\n- Backtesting framework\n- Strategy implementation\n- Market data analysis\n- Performance metrics\n\n## Technologies Used\n\n- Python\n- Pandas\n- NumPy\n- Matplotlib",

        "ai-library": "# AI Library\n\nA comprehensive library of AI algorithms and tools.\n\n## Features\n\n- Machine learning algorithms\n- Deep learning models\n- Natural language processing tools\n- Computer vision utilities\n\n## Technologies Used\n\n- Python\n- TensorFlow\n- PyTorch\n- Hugging Face Transformers",

        "ai-financial-agent": "# AI Financial Agent\n\nAn advanced quantitative analysis platform combining machine learning, forensic accounting, and real-time market monitoring for stocks and cryptocurrencies.\n\n## Features\n\n- Market analysis and trend detection\n- Investment recommendations based on quantitative models\n- Risk assessment and portfolio optimization\n- Real-time monitoring of market conditions\n- Forensic accounting analysis for fraud detection\n\n## Technologies Used\n\n- Python\n- Machine Learning\n- Financial APIs\n- Natural Language Processing\n- Time Series Analysis\n- Quantitative Modeling",

        "ai-hedge-fund": "# AI Hedge Fund\n\nAI-powered hedge fund simulation and strategy testing.\n\n## Features\n\n- Market simulation\n- Strategy backtesting\n- Risk management\n- Performance analytics\n\n## Technologies Used\n\n- Python\n- Machine Learning\n- Financial APIs\n- Statistical Analysis",

        "DeepSeek-V3": "# DeepSeek V3\n\nAdvanced deep learning framework for complex tasks.\n\n## Features\n\n- State-of-the-art model architectures\n- Transfer learning capabilities\n- Multi-modal learning\n- Distributed training\n\n## Technologies Used\n\n- Python\n- PyTorch\n- CUDA\n- Distributed Computing"
    };

    // For all repositories, use the repo name as the key
    return readmeContent[repoName] || null;
}
