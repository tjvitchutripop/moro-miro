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
    let ideas = ["test1", "test2", "test3","test1", "test2", "test3","test1", "test2", "test3","test2", "test3"]
    let cards = [{title:"test", description: 'hello world', dueDate: '2021-08-29'}, {title:"test2", description: 'hello world2'}, {title:"test3", description: 'hello world3', dueDate: '2021-08-29'}]

    const [productIdea, setProductIdea] = useState("");
    const [apiKey, setAPIKey] = useState("");
    const [apiKeyValid, setapiKeyValid] = useState(false);

    function handleAPIKeyChange(apiKey){

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
   

  return (
    <div>
      <h3>API Key</h3>
      <input onChange={(event) => {setAPIKey(event.target.value)}} placeholder='Enter API Key'></input>
      <button>Confirm API Key</button>

      <p>PRODUCT IDEA: {productIdea}</p>
      <input onChange={(event) => {setProductIdea(event.target.value)}}></input>
      <button className="btn btn-primary" onClick={()=>addStickyNotes(ideas)}>
        Add sticky notes
      </button>
      <button className="btn btn-primary" onClick={()=>addCards(cards)}>
        Add cards
      </button>

      <button className="btn btn-primary" onClick={() => generateIdeas()}>
        Generate Ideas

      </button>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
