import React from 'react'
import PromptSuggestionButton from './PromptSuggestionButton'


const PromptSuggestionRow = ({onPromptClick}) => {
    const prompts=[
        "What is Database?",
        "What is Database Management System?",
        "What is the role of Database Administrator?",
        "What is ER Diagram?"
    ]
  return (
    <div className='promt-sug-row'>
        {prompts.map((prompt,index)=><PromptSuggestionButton 
                                            key={`suggestion-${index}`} 
                                            text={prompt}
                                            onClick={()=>onPromptClick(prompt)}
        />)}
    </div>
  )
}
export default PromptSuggestionRow