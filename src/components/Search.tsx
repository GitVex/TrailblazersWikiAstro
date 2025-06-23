import {h} from 'preact';
import {useState, useEffect, useCallback} from 'preact/hooks';
import type {Pagefind, PagefindSearchFragment} from "vite-plugin-pagefind/types";

function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([] as PagefindSearchFragment[]);
    const [loading, setLoading] = useState(false);
    const [pagefind, setPagefind] = useState({} as Pagefind);

    useEffect(() => {
        console.log('Initializing Pagefind...');
        const initPagefind = async () => {
            if (typeof window !== 'undefined') {
                try {
                    //@ts-ignore
                    const pagefindModule = await import('/dist/pagefind/pagefind.js');
                    setPagefind(pagefindModule);
                } catch (error) {
                    console.error('Failed to load Pagefind:', error);
                }
            }
        };
        initPagefind();
    }, []);

    const performSearch = useCallback(async (term: any) => {
        if (pagefind && term.length > 2) {
            setLoading(true);
            const search = await pagefind.search(term);
            console.log('Searched with:', term, 'results:', search);
            const searchResults = await Promise.all(search.results.map(r => r.data()));
            setResults(searchResults);
            setLoading(false);
        } else {
            setResults([]);
        }
    }, [pagefind]);

    const handleInputChange = (event) => {
        const term = event.currentTarget.value;
        setSearchTerm(term);
        performSearch(term);
    };

    return (
        <div>
            <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleInputChange}
            />
            {loading && <div>Loading...</div>}
            <ul>
                {results.map((result) => (
                    <li key={result.id}>
                        <a href={result.url}>
                            <h3>{result.meta.title}</h3>
                            <p dangerouslySetInnerHTML={{__html: result.excerpt}}/>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Search;