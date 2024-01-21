import OpenAI from "openai";


export async function VerifyAPIKey(apiKey) {
    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });

    const dataObject = {
        messages: [{ role: 'system', content: 'This is a test' }],
        model: 'gpt-3.5-turbo-1106' 
    };

    try {
        await openai.chat.completions.create(dataObject);
        return true; // If the request is successful, the key is considered valid
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return false; // If there's an error, the key is considered invalid
    }
}

export async function getChatCompletion(API_KEY, message, tool_choice, model="gpt-3.5-turbo-1106"){
    const openai = new OpenAI({
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true
    });
//     var returnX = {
//     "id": "chatcmpl-8jL7eEMo59RRus3u26ijvecOrwxg4",
//     "object": "chat.completion",
//     "created": 1705816646,
//     "model": "gpt-3.5-turbo-1106",
//     "choices": [
//         {
//             "index": 0,
//             "message": {
//                 "role": "assistant",
//                 "content": null,
//                 "tool_calls": [
//                     {
//                         "id": "call_nuizEnYR6QPrMctUVtbsoApo",
//                         "type": "function",
//                         "function": {
//                             "name": "create_user_journey_object",
//                             "arguments": "{\"user_journey_string\":\"Sign Up$Book a Ride$Track Ride$Payment\",\"user_epic_string\":\"Sign Up:User Onboarding$Book a Ride:Ride Searching and Booking$Track Ride:Ride Tracking and Status$Payment:Payment and Transactions\",\"user_story_string\":\"User Onboarding:Create Account:Sign up with email and password$User Onboarding:Mobile Verification:Verify phone number for account creation$Ride Searching and Booking:Search for Ride:Find available rides based on location$Ride Searching and Booking:Select Ride:Choose preferred ride option$Ride Tracking and Status:Track Ride:View real-time location of the ride$Payment:Payment Options:Choose payment method$Payment:Complete Transaction:Finalize ride payment\"}"
//                         }
//                     }
//                 ]
//             },
//             "logprobs": null,
//             "finish_reason": "stop"
//         }
//     ],
//     "usage": {
//         "prompt_tokens": 369,
//         "completion_tokens": 154,
//         "total_tokens": 523
//     },
//     "system_fingerprint": "fp_aaa20cc2ba"
// }

//     return returnX;
    var dataObject = {
        messages: [{ role: "user", content: message }],
        model: model,
        tools: toolsList
    }

    if (tool_choice != null){
        dataObject["tool_choice"] = tool_choice;
    }
    
    const chatCompletion = await openai.chat.completions.create(dataObject);
    return chatCompletion;
}


export const toolsList = [
    {
        "type": "function",
        "function": {
            "name": "create_sticky_notes",
            "description": "This function creates sticky notes within the user's board.",
            "parameters": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "These are the sentences to be converted into sticky notes. The sentences should be separated by a dollar sign, each sentence will be converted to one sticky note."
                    },
                },
                "required": ["text"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "create_user_journey_object",
            "description": "This function creates the user journey object within the user's board.",
            "parameters": {
                "type": "object",
                "properties": {
                    
                    "user_story_string":{
                        "type":"string",
                        "description": "This string contains user stories separated by dollar signs."
                    }
                },
                "required": ["user_story_string"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_pros_and_cons",
            "description": "This function creates the pros and cons for the product idea..",
            "parameters": {
                "type": "object",
                "properties": {
                    "pros_string": {
                        "type": "string",
                        "description": "This string contains all the pros of the product idea, separated by dollar signs.."
                    },
                    "cons_string":{
                        "type": "string",
                        "description": "This string contains all the cons of the product idea, separated by dollar signs."
                    }
                },
                "required": ["pros_string", "cons_string"]
            }
        }
    }

];

// export const tools = [
//     {
//         "type": "function",
//         "function": {
//             "name": "[INSERT NAME]",
//             "description": "[INSERT DESCRIPTION]",
//             "parameters": {
//                 "type": "object",
//                 "properties": {
//                     "VAR1": {
//                         "type": "string",
//                         "description": "VAR1 Description"
//                     },
//                     "EX_VAR2": {
//                         "type":"string",
//                         "enum": ["EX1", "EX2"],
//                         "description": "EX_VAR2 DESCRIPTION"
//                     }
//                 },
//                 "required": ["VAR1", "EX_VAR2"]
//             }
//         }
//     },
// ];