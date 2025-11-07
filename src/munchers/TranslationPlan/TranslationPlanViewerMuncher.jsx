import { useEffect, useState}from "react";
import { Box, Grid2} from "@mui/material";

function TranslationPlanViewerMuncher({ metadata }) {
    const [ingredient, setIngredient] = useState([]);

    const getAllData = async () => {
        const ingredientLink = `/burrito/ingredient/raw/${metadata.local_path}?ipath=plan.json`;
        const response = await fetch(ingredientLink);

        if (response.ok) {
            const data = await response.json();
            setIngredient(data);
        } else {
            setIngredient([]);
        }
    };
    
    useEffect(
        () => {
            getAllData().then();
        },
        []
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid2
                container
                direction="row"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Grid2
                    item
                    size={3}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >

                </Grid2>
                <Grid2 item size={12}>
                    <pre >
                        {JSON.stringify(ingredient, null, 2)}
                    </pre>

                </Grid2>
            </Grid2>
        </Box>
    );
}

export default TranslationPlanViewerMuncher;
