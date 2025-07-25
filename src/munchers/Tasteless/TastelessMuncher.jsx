import {useEffect, useState, useContext} from "react";
import {Box, Button, Grid2} from "@mui/material";
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {i18nContext as I18nContext, debugContext as DebugContext, getJson, doI18n} from "pithekos-lib";

function TastelessMuncher({metadata}) {
    const [sbMetadata, setSbMetadata] = useState();
    const [showMetadata, setShowMetadata] = useState(false);
    const {debugRef} = useContext(DebugContext);
    const {i18nRef} = useContext(I18nContext);

    const getAllData = async () => {
        const sbMetadataLink = `/burrito/metadata/raw/${metadata.local_path}`;
        let response = await getJson(sbMetadataLink, debugRef.current);
        if (response.ok) {
            setSbMetadata(response.json);
        }
    }

    useEffect(
        () => {
            getAllData().then();
        },
        []
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid2 container
                direction="row"
                sx={{
                    display:"flex",
                    justifyContent: "center",
                    alignItems: "center"
                }} 
                spacing={2}
            >
                <Grid2 item size={12}>
                    <Box sx={{p:2}}>
                        <h5>{metadata.name}</h5>
                        <p><b>{doI18n("munchers:tasteless:title", i18nRef.current)}</b></p>
                        {metadata.description.length > 0 &&
                            <p>Description: {metadata.description}</p>}
                        <p>Flavor: {doI18n(`flavors:names:${metadata.flavor_type}/${metadata.flavor}`, i18nRef.current)}</p>
                        <p>Source: {metadata.local_path}</p>
                    </Box>
                </Grid2>
                {sbMetadata &&
                    <Box sx={{p:2}}>
                        <Grid2 item size={12}>
                            <Button
                                variant="outlined"
                                size="small"
                                endIcon={showMetadata ? <UnfoldLessIcon/> : <UnfoldMoreIcon/>}
                                onClick={() => setShowMetadata(!showMetadata)}
                            >
                                {doI18n("munchers:tasteless:show_metadata", i18nRef.current)}
                            </Button>
                        </Grid2>
                        {showMetadata &&
                            <Grid2 item size={12}>
                                {JSON.stringify(sbMetadata, null, 2)}
                            </Grid2>
                        }
                    </Box>
                }
            </Grid2>
        </Box>
    );
}

export default TastelessMuncher;
