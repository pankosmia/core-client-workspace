import WorkspaceCard from "./WorkspaceCard";
import {doI18n} from "pithekos-lib";

const paneStyle = {
    width: '100%',
    height: '100%',
    overflow: 'auto',
}

const top_layout = (resources, i18nRef, distractionModeCount) => {
      const te = {};
    const rp = {
        children: [
            null,
            {
                children: [],
                isRow: true
            }
        ],
    }
    for (const resource of resources) {
        let location = `${resource.local_path.split('/').slice(0, 2).reverse().join(" - ")}`;
        if (resource.local_path.split('/')[1].startsWith("_")) {
            location = doI18n(`pages:core-local-workspace:${resource.local_path.split('/')[1]}`, i18nRef.current);
        }
        const title = `${resource.name} (${location})`;
        te[title] = <WorkspaceCard
            metadata={resource}
            style={paneStyle}
            distractionModeCount={distractionModeCount}
        />;
        if (resource.primary) {
            rp.children[0] = { children: title };
        } else {
            rp.children[1].children.push({ children: title });
        }
    }
    if (rp.children[1].children.length === 0) {
        rp.children.pop();
    }
    return [rp, te];
    }

const bottom_layout = (resources, i18nRef, distractionModeCount) => {
      const te = {};
    const rp = {
        children: [
            {
                children: [],
                isRow: true
            },
            null
        ],
    }
    for (const resource of resources) {
        let location = `${resource.local_path.split('/').slice(0, 2).reverse().join(" - ")}`;
        if (resource.local_path.split('/')[1].startsWith("_")) {
            location = doI18n(`pages:core-local-workspace:${resource.local_path.split('/')[1]}`, i18nRef.current);
        }
        const title = `${resource.name} (${location})`;
        te[title] = <WorkspaceCard
            metadata={resource}
            style={paneStyle}
            distractionModeCount={distractionModeCount}
        />;
        if (resource.primary) {
            rp.children[1] = { children: title };
        } else {
            rp.children[0].children.push({ children: title });
        }
    }
    if (rp.children[0].children.length === 0) {
        rp.children.shift();
    }
    return [rp, te];
    }

const left_layout = (resources, i18nRef, distractionModeCount) => {
      const te = {};
    const rp = {
        children: [
	    null,
            {
                children: [],
                isRow: false
            },
        ],
	isRow: true,
    }
    for (const resource of resources) {
        let location = `${resource.local_path.split('/').slice(0, 2).reverse().join(" - ")}`;
        if (resource.local_path.split('/')[1].startsWith("_")) {
            location = doI18n(`pages:core-local-workspace:${resource.local_path.split('/')[1]}`, i18nRef.current);
        }
        const title = `${resource.name} (${location})`;
        te[title] = <WorkspaceCard
            metadata={resource}
            style={paneStyle}
            distractionModeCount={distractionModeCount}
        />;
        if (resource.primary) {
            rp.children[0] = { children: title, isRow: false };
        } else {
            rp.children[1].children.push({ children: title });
        }
    }
    if (rp.children[1].children.length === 0) {
        rp.children.pop();
    }
    return [rp, te];
    }

const layouts = {
  top: top_layout,
    bottom: bottom_layout,
    left: left_layout
}

export default layouts;
