import OpenAI from "openai";



export async function getChatCompletion(apiKey, message, tool_choice){
    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });
    // var returnX = {
    //     "id": "chatcmpl-8j2sAY0A9uphxEpTwY3IVEDF3IAGn",
    //     "object": "chat.completion",
    //     "created": 1705746494,
    //     "model": "gpt-3.5-turbo-0613",
    //     "choices": [
    //         {
    //             "index": 0,
    //             "message": {
    //                 "role": "assistant",
    //                 "content": null,
    //                 "tool_calls": [
    //                     {
    //                         "id": "call_NJDKdc2Y34b98BKGMa1w5CXB",
    //                         "type": "function",
    //                         "function": {
    //                             "name": "create_sticky_note",
    //                             "arguments": "{\n  \"text\": \"John Cena\"\n}"
    //                         }
    //                     }
    //                 ]
    //             },
    //             "logprobs": null,
    //             "finish_reason": "tool_calls"
    //         }
    //     ],
    //     "usage": {
    //         "prompt_tokens": 79,
    //         "completion_tokens": 18,
    //         "total_tokens": 97
    //     },
    //     "system_fingerprint": null
    // }

    // return returnX;
    var dataObject = {
        messages: [{ role: "user", content: message }],
        model: "gpt-3.5-turbo-1106",
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