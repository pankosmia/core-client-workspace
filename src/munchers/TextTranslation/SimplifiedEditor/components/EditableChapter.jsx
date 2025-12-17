export default function EditableChapter({ block }) {

    return (
        <div className="marks_chapter_label" style={{float: "none"}}>
            <span>{block.chapter}</span>
        </div>
    );

}