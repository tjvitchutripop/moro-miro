import {useEffect, useState}from 'react';
import {createRoot} from 'react-dom/client';
import { VerifyAPIKey, getChatCompletion } from './openapi';
import '../src/assets/style.css';
import ListMenu from "../src/assets/listIcon.png";

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

async function addUserStoryShapesAndCards(userStoryList){
  userStoryList.unshift("Example User Stories");
  const defaultCardHeight = 94;
  const defaultCardWidth = 500;
  const cardPositionPadding = 4;

  let curr_row = 0;
  userStoryList.forEach(userStoryStr => {
    miro.board.createCard({
      title: userStoryStr,
      relativeTo: 'parent_top_left',
      width: defaultCardWidth,
      x: 0,
      y: curr_row * (defaultCardHeight + cardPositionPadding)
    })
  
  curr_row++;
  })

}

async function addProsAndConsStickyNotes(prosList, consList){
  const cols = 2;
  let curr_row = 0;
  let lastStickyNote = null;
  curr_row = 1;

  for (let i = 0; i < prosList.length; i++){
    const stickyNote = await miro.board.createStickyNote({
      content: prosList[i],
      relativeTo: "parent_top_left",
      x: 0,
      y: curr_row * 210,
      style:{
        fillColor: 'light_green'
      }
    })
    if (i == 0) lastStickyNote = stickyNote;

    curr_row++;
  }

  curr_row = 1;
  for (let i = 0; i < consList.length; i++){
    const stickyNote = await miro.board.createStickyNote({
      content: consList[i],
      relativeTo: "parent_top_left",
      x: 210,
      y: curr_row * 210,
      style:{
        fillColor: 'light_pink'
      }
    })
    curr_row++;
  }

  await miro.board.viewport.zoomTo(lastStickyNote);
}

async function addStickyNotes(ideas) {
  const { rows, columns } = calculateRowsColumns(ideas.length);
  var lastStickyNote = null;
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
    lastStickyNote = stickyNote;
  }
  await miro.board.viewport.zoomTo(titleNote);

}

async function addCards(cards){
  for (let i = 0; i < cards.length; i++) {
    const card = await miro.board.createCard(cards[i]);
    await miro.board.viewport.zoomTo(card);
  }

}

const App = () => {
    const GenerateModes = ["Feature Ideas", "User Stories", "Pros and Cons Analysis"];
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

    async function generateButtonClick(){
      if(generateMode == "Feature Ideas"){
        generateIdeas();
      }
      if(generateMode == "User Stories"){
        generateUserStories();
      }
      if (generateMode == "Pros and Cons Analysis"){
        generateProsAndCons();
      }
    }



    async function verifyAPIKey(){
      let isValid = await VerifyAPIKey(apiKey);
      setapiKeyValid(isValid);
    }

    async function generateProsAndCons(){
      var generatePrompt = "Generate pros and cons for the following product or project idea. Respond with two strings. The first string lists all the pros, basically what is the benefit of having this product, separated by dollar signs. The second string lists all the cons, or things that may make this product inferior or harder to implement, separated by dollar signs. Idea: ###".concat(productIdea, "###");
      var toolChoice = {"type": "function", "function": {"name": "create_pros_and_cons"}};

      getChatCompletion(apiKey, generatePrompt, toolChoice, "gpt-3.5-turbo-1106").then(chatCompletion => {
        var chatCompletionJson = JSON.parse(JSON.stringify(chatCompletion));
        var toolCalls = chatCompletionJson.choices[0].message.tool_calls; 

        toolCalls.forEach((obj) => {
          var functionName = obj.function.name;

          if (functionName == "create_pros_and_cons"){
            var functionArguments = JSON.parse(obj.function.arguments);

            var prosList = functionArguments.pros_string.split("$");
            prosList.unshift("Pros");
            var consList = functionArguments.cons_string.split("$");
            consList.unshift("Cons");
            
            addProsAndConsStickyNotes(prosList, consList);

          }
        })
      })

    }

    async function generateUserStories(){
      var generatePrompt = "Generate user stories for the user's product idea. Return a string that contains at least 10 user stories separated by a dollar sign each. All user stories should be written in the format of 'As a [type of user], I want [feature] so that I can [reason].' Make sure to follow the output requirement carefully. The Idea: ###".concat(productIdea, "###");
      var toolChoice = {"type": "function", "function": {"name": "create_user_journey_object"}};

      getChatCompletion(apiKey, generatePrompt, toolChoice, "gpt-4").then(chatCompletion => {
        var chatCompletionJson = JSON.parse(JSON.stringify(chatCompletion));
        var toolCalls = chatCompletionJson.choices[0].message.tool_calls; 

        
        toolCalls.forEach((obj) => {
          var functionName = obj.function.name;

          if (functionName == "create_user_journey_object"){
            var functionArguments = JSON.parse(obj.function.arguments);

            var userJourneyObject = {}
            var userEpicObject = {}
            var userStories = functionArguments.user_story_string.split("$")
             addUserStoryShapesAndCards(userStories);
          }
        })
      })


    }

    async function generateIdeas(){
      var generatePrompt = "Generate 5 to 7 different additional feature ideas as sticky notes for the following project idea as brief sentences. Each sentence must be separated by a dollar sign to allow the function to work properly. Idea: '''".concat(productIdea, "'''");
      var toolChoice = {"type": "function", "function": {"name": "create_sticky_notes"}}

      getChatCompletion(apiKey, generatePrompt, toolChoice, "gpt-3.5-turbo-1106").then(chatCompletion => {
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
        var generatePrompt = "Provide brief and concise tips for the following project idea given that the developers are interested in coming up with ".concat(g,". Respond with why it is important for the user's product idea. Do not engage in conversation and speak in a passive voice. Provide high level advice in paragraph form. Idea: '''",productIdea, "'''");
        getChatCompletion(apiKey, generatePrompt,  "none", "gpt-3.5-turbo-1106")
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
      <h1>Welcome to <br></br>Moro-Miro!</h1>
      <div  style={{display: 'block', justifyContent: 'center', alignItems: 'center'}} class={apiKeyValid == false?"form-group error":"form-group"}>
        <input id="error-1" class="input" onChange={(event) => {setAPIKey(event.target.value)}} placeholder='Enter your API Key'></input><br></br>
        {apiKeyValid == false && <div class="status-text">Please enter a valid API key.</div>}

      </div>
      <a href="https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key" style={{color: "#007bff"}}>What is the OpenAI API key? →</a>
      <br>
      </br>
      <br>
      </br>
      <button  style={{float: 'right'}} class="button button-primary" onClick={()=>{verifyAPIKey()}}>Enter</button>
      </div>
      }
      {/* Idea Submission Page */}
      {apiKeyValid == true && ideaConfirmed == false &&
        <div>
          <h1>Moro! 👋 How can I help you today?</h1>
          <textarea class="textarea" placeholder="What are you imagining..." onChange={(event) => {setProductIdea(event.target.value)}}></textarea>
          <br>
      </br>          <br>
      </br>
      
          <button class="button button-primary" style={{float:'right', marginTop:10}} onClick={()=>setIdeaConfirmed(true)}> Enter </button>
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
        <h2 style={{marginTop:-10, color: "#4262FF"}}>Product Idea:</h2>
        <p style={{marginTop:-10, marginBottom:30}}><i>{productIdea}</i></p>
        <h2 style={{color: "#4262FF"}}>☰ Next Steps</h2>
        <p style={{marginTop:-10, marginBottom:30}}>Here are a couple of steps you can take to further develop your project.</p>
        <div style={{textAlign:"center"}}>
          <button type="button" class="button button-primary" onClick={() => setGenerateMode("Feature Ideas")} style={{width:300}}>Feature Ideas <span class="icon-arrow-right"></span></button>
          <br/>
          <button type="button"  class="button button-primary" onClick={() => setGenerateMode("User Stories")} style={{width:300}}>User Stories <span class="icon-arrow-right"></span></button>
          <br/>
          <button type="button"  class="button button-primary" onClick={() => setGenerateMode("Pros and Cons Analysis")} style={{width:300}}>Pros and Cons Analysis<span class="icon-arrow-right"></span></button>
          <br/>
          <button  type="button" class="button button-primary" style={{width:300, background:"#B0B0B0"}} >Competitor Analysis<span class="icon-arrow-right" disabled></span></button>
          <br/>
          <button type="button"  class="button button-primary" style={{width:300,  background:"#B0B0B0"}}>Market Analysis<span class="icon-arrow-right" disabled></span></button>
          <br/>
          <button  type="button" class="button button-primary" style={{width:300,  background:"#B0B0B0"}}>Work Breakdown Schedule<span class="icon-arrow-right" disabled></span></button>
          <br/>
          <button type="button"  class="button button-primary" style={{width:300,  background:"#B0B0B0"}}>Project Management Timeline<span class="icon-arrow-right" disabled></span></button>    
        </div>
      </div>
      }
      {/* Generate Mode Screen */}
      {generateMode != "" &&
      <div>
        <button class="button button-tertiary" onClick={() => {setGenerateMode("")}} style={{width:300, color:"#fffff"}}> <span class="icon-arrow-left"></span> Back to Menu</button>
        <h2 style={{marginTop:-10}}>{generateMode}</h2>
        {
          suggestion === null && <p>Suggestion loading...</p>
        }
        <p style={{marginTop:-10, marginBottom:30}}>{suggestion[generateMode]}</p>
        <button class="button button-primary" onClick={() => {generateButtonClick()}} style={{width:300}}> Generate a template!</button>
      </div>}
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
