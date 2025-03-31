import {h} from 'preact';
import "./styles/ExplorerItem.scss";
import {explorerStore} from "./stores/ExplorerStateStore.ts"; // Import our store
import pkg from "voca";

const {capitalize} = pkg;

interface TreeObject {
    [key: string]: any[] | TreeObject;
}

interface Props {
    name: string;
    items: TreeObject;
    path: string;
    slugMap: Record<string, any>;
}

export default function ExplorerItem({name, items, path, slugMap}: Props) {
    let isExpanded = path === '/content' ? true : explorerStore.folders[path] ?? false

    const toggle = () => {
        explorerStore.toggleFolder(path);
    };

    return (
        <li className={`folder-item ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <p
                className="folder-label"
                onClick={() => {
                    console.log('Turn on the TV, any channel! They hit the second button.');
                    toggle();
                }}
            >
                {name.split('-').map((string) => capitalize(string)).join(' ')}
            </p>
            {isExpanded && (
                <ul className="folder-contents">
                    {Object.entries(items).map(([key, value]) => {
                        if (Array.isArray(value)) {
                            return (
                                <li key={key} className="file-label">
                                    <a href={slugMap[key].route}>{slugMap[key].name}</a>
                                </li>
                            );
                        } else {
                            return (
                                <ExplorerItem
                                    key={key}
                                    name={key}
                                    items={value}
                                    path={`${path}/${key}`}
                                    slugMap={slugMap}
                                />
                            );
                        }
                    })}
                </ul>
            )}
        </li>
    );
}
