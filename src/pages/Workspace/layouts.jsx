import WorkspaceCard from "./WorkspaceCard";
import {doI18n} from "pithekos-lib";

const paneStyle = {
    width: '100%',
    height: '100%',
    overflow: 'auto',
}

const layoutSpecs = {
    top: {
	editorPos: 0,
	parentIsRow: false,
	childrenAreRow: true
    },
    bottom: {
	editorPos: 1,
	parentIsRow: false,
	childrenAreRow: true
    },
    leftV: {
	editorPos: 0,
	parentIsRow: true,
	childrenAreRow: true
    },    
    leftH: {
	editorPos: 0,
	parentIsRow: true,
	childrenAreRow: false
    },
    rightV: {
	editorPos: 1,
	parentIsRow: true,
	childrenAreRow: true
    },   
    rightH: {
	editorPos: 1,
	parentIsRow: true,
	childrenAreRow: false
    }
};

const layoutJson = (resources, layoutId, i18nRef, distractionModeCount) => {
    const te = {};
    let layoutSpec = layoutSpecs[layoutId];
    if (!layoutSpec) {
	throw new Error(`No layout spec for '${layoutId}'`);
    }
    let rp = {
        children: [
            {
                children: [],
                isRow: layoutSpec.childrenAreRow
            }
        ],
	isRow: layoutSpec.parentIsRow
    }
    if (layoutSpec.editorPos === 0) {
	rp.children = [null, rp.children[0]];
    } else {
	rp.children = [rp.children[0], null];
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
            rp.children[layoutSpec.editorPos] = { children: title };
        } else {
            rp.children[1 - layoutSpec.editorPos].children.push({ children: title });
        }
    }
    if (rp.children[1 - layoutSpec.editorPos].children.length === 0) {
        layoutSpec.editorPos ? rp.children.shift : rp.children.pop();
    }
    return [rp, te];
    }

export default layoutJson;
