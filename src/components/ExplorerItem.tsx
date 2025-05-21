import {h} from 'preact';
import "./styles/ExplorerItem.scss";
import {explorerStore} from "./stores/ExplorerStateStore.ts"; // Import our store
import pkg from "voca";
import {isAuthed} from "./stores/UserStateStore.ts";

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
    function hasVisibleContent(currentItems: TreeObject) {
        if (!currentItems || Object.keys(currentItems).length === 0) {
            return false;
        }

        for (const [key, value] of Object.entries(currentItems)) {
            if (Array.isArray(value)) {
                if (isAuthed(slugMap[key]?.allowedUsers)) {
                    return true; // Found a visible (authorized) file
                }
            } else {
                // This 'key' represents a sub-folder, and 'value' is its TreeObject (the sub-folder's items).
                // Recursively check if the sub-folder has visible content.
                if (hasVisibleContent(value)) { // 'value' is the items for the sub-folder
                    return true; // Found a sub-folder that will render (it has content)
                }
            }
        }
        return false;
    }


    let isExpanded = path === '/content' ? true : explorerStore.folders[path] ?? false

    const toggle = () => {
        explorerStore.toggleFolder(path);
    };

    if (!hasVisibleContent(items)) {
        return null;
    }

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
                            if (!isAuthed(slugMap[key]?.allowedUsers)) {
                                return null;
                            }

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
