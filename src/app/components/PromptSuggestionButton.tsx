const PromptSuggestionButton=({text, onClick})=>{
    return (
        <button className="prompt-sug-btn" onClick={onClick}>
            {text}
        </button>
    )
}

export default PromptSuggestionButton;