import {useEffect, useState}from 'react';
import {createRoot} from 'react-dom/client';
import { VerifyAPIKey, getChatCompletion } from './openapi';
import '../src/assets/style.css';

function calculateRowsColumns(totalCards) {
  // Calculate the square root
  let squareRoot = Math.sqrt(totalCards);
  
  // Determine the number of rows and columns
  let rows = Math.floor(squareRoot);
  let columns = Math.ceil(totalCards / rows);

  return { rows, columns };
}

const functionNameMapping = {
  "create_sticky_note": addStickyNotes
}



async function addStickyNotes(ideas) {
  const { rows, columns } = calculateRowsColumns(ideas.length);
  let curr_row = -1;
  let curr_col = 0;
  for (let i = 0; i < ideas.length; i++) {
    if (i % columns === 0) {
      curr_row++;
      curr_col = 0;
    }
    const stickyNote = await miro.board.createStickyNote({
      content: ideas[i],
      relativeTo: "parent_top_left",
      x: 0 + curr_col * 200,
      y: 0 + curr_row * 200,
    });
    // frame.add(stickyNote);
    curr_col++;
  }

}

async function addCards(cards){
  for (let i = 0; i < cards.length; i++) {
    const card = await miro.board.createCard(cards[i]);
    await miro.board.viewport.zoomTo(card);
  }

}

const App = () => {
    const GenerateModes = ["Feature Ideas", "User Stories"];
    let cards = [{title:"test", description: 'hello world', dueDate: '2021-08-29'}, {title:"test2", description: 'hello world2'}, {title:"test3", description: 'hello world3', dueDate: '2021-08-29'}]

    const [productIdea, setProductIdea] = useState("");
    const [apiKey, setAPIKey] = useState("");
    const [apiKeyValid, setapiKeyValid] = useState(null);
    const [ideaConfirmed, setIdeaConfirmed] = useState(false);
    const [generate, setGenerate] = useState(false);
    const [generateMode, setGenerateMode] = useState("");
    const [suggestion, setSuggestion] = useState(null);

    useEffect(() => { 
      if(ideaConfirmed == true){
        generateSuggestion();
      }
    },[ideaConfirmed]);

    useEffect(() => { 
      if(generateMode == "Feature Ideas"){
        generateIdeas();
      }
      if(generateMode == "User Stories"){
      }
      setGenerate(false);
    },[generate]);

    async function verifyAPIKey(){
      let isValid = await VerifyAPIKey(apiKey);
      setapiKeyValid(isValid);
    }

    async function generateIdeas(){
      var generatePrompt = "Generate 5 to 7 different additional feature ideas as sticky notes for the following project idea as brief sentences. Each sentence must be separated by a dollar sign to allow the function to work properly. Idea: '''".concat(productIdea, "'''");
      var toolChoice = {"type": "function", "function": {"name": "create_sticky_notes"}}

      getChatCompletion(apiKey, generatePrompt, toolChoice).then(chatCompletion => {
        var chatCompletionJson = JSON.parse(JSON.stringify(chatCompletion));
        var toolCalls = chatCompletionJson.choices[0].message.tool_calls;
    
        toolCalls.forEach((obj) => {
          var functionName = obj.function.name;
    
          if (functionName == "create_sticky_notes"){
            var functionArguments = JSON.parse(obj.function.arguments);
            var stickyNoteText = functionArguments.text;
            var ideas = stickyNoteText.split("$");
            ideas = ideas.map((str) => str.trim());
            addStickyNotes(ideas)
            
          }
            
        })
    }).catch(error => {
        console.error("Error:", error);
    });
    }

    async function generateSuggestion(){
      var new_suggestion = {};
      GenerateModes.forEach((g) => {
        var generatePrompt = "Provide tips for the following project idea given that the developers are interested in coming up with ".concat(g,". Do not engage in conversation and provide high level advice in paragraph form. Idea: '''",productIdea, "'''");
        getChatCompletion(apiKey, generatePrompt, "none")
        .then(chatCompletion => {
          var chatCompletionJson = JSON.parse(JSON.stringify(chatCompletion))  
          new_suggestion[g] = chatCompletionJson.choices[0].message.content
        })
        .catch(error => {
            console.error("Error:", error);
        });
      })
      setSuggestion(new_suggestion);
    }
   

  return (
    <div>
      {/* Welcome Page */}
      {apiKeyValid != true && 
      <div>
      <h1>Welcome to Moro-Miro!</h1>
      <div class={apiKeyValid == false?"form-group error":"form-group"}>
        <input id="error-1" class="input" onChange={(event) => {setAPIKey(event.target.value)}} placeholder='Enter your API Key'></input>
        {apiKeyValid == false && <div class="status-text">Invalid API Key</div>}
        <button style={{marginTop:10}} class="button button-primary" onClick={()=>{verifyAPIKey()}}>Submit</button>
      </div>
      </div>
      }
      {/* Idea Submission Page */}
      {apiKeyValid == true && ideaConfirmed == false &&
        <div>
          <h1>Moro! How can I help you today?</h1>
          <textarea class="textarea" placeholder="What are you imagining..." onChange={(event) => {setProductIdea(event.target.value)}}></textarea>
          <button class="button button-primary" style={{marginTop:10}} onClick={()=>setIdeaConfirmed(true)}> Enter Idea </button>
        </div>
      }
      {/* Loading Screen */}
      {
        ideaConfirmed == true && suggestion == null &&
        <button class="button button-primary button-loading" type="button"></button>
      }
      {/* Menu for next steps */}
      { ideaConfirmed == true && generateMode == "" &&
      <div>
        <h2 style={{marginTop:-10}}>Your Idea</h2>
        <p style={{marginTop:-10, marginBottom:30}}>{productIdea}</p>
        <h2>Next Steps</h2>
        <p style={{marginTop:-10, marginBottom:30}}>Here are a couple of steps you can take to further develop your project.</p>
        <div style={{textAlign:"center"}}>
          <button class="button button-primary" onClick={() => setGenerateMode("Feature Ideas")} style={{width:300}}>Feature Ideas <span class="icon-arrow-right"></span></button>
          <br/>
          <button class="button button-primary" onClick={() => setGenerateMode("User Stories")} style={{width:300}}>User Stories <span class="icon-arrow-right"></span></button>
          <br/>
          <br/>
        </div>
      </div>
      }
      {/* Generate Mode Screen */}
      {generateMode != "" &&
      <div>
        <button class="button button-tertiary" onClick={() => {setGenerateMode("")}} style={{width:300, color:"#fffff"}}> <span class="icon-arrow-left"></span> Back to Menu</button>
        <h2 style={{marginTop:-10}}>{generateMode}</h2>
        <p style={{marginTop:-10, marginBottom:30}}>{suggestion[generateMode]}</p>
        <button class="button button-primary" onClick={() => {setGenerate(true)}} style={{width:300}}> Generate </button>
      </div>}
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
