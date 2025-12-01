import { Typography } from "@mui/material";

export default function StoryChapter({ scriptureJson }) {

    return (
        scriptureJson.blocks.filter(t => t.type === "chapter").map((t) => (
            <Typography>
                {t.type} - {t.chapter}
            </Typography>

        ))

    );

}