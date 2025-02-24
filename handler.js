exports.hello = async (event) => {
  const fsPromises = require('fs').promises;
  const responseData= await fsPromises.readFile('response.json', 'utf-8');
  const responseDataJson = JSON.parse(responseData)
  
  return {
    statusCode: 200,
    body: JSON.stringify(responseDataJson),
  };
};

exports.recommendations = async (event, context) => {
  let body, bank_statement;
  try{
  const REGION = "ap-south-1";
  const {accessKeyId,secretAccessKey}=process.env
  if(!event) {
    return {
      statusCode: 400,
      body: JSON.stringify({message:"No Event found"}),
    };
  }

  event = typeof event === "string" ? JSON.parse(event) : event

  body =event.body;

  body = typeof body === "string" ? JSON.parse(body) : body

  bank_statement = body.bank_statement;

if(!bank_statement) {
  return {
    statusCode: 401,
    body: JSON.stringify({message:"No bank_statement found", body}),
  };
}
try {
// Set the model ID, e.g., Jurassic-2 Mid.
const modelId = "apac.anthropic.claude-3-5-sonnet-20240620-v1:0";
  
const assistantPrompt =
  `Return a JSON structure only with 'cross_marketing_banners' as the top-level key.
  Within it, include 'smart_suggestions' as a list. Each item in 'smart_suggestions' should be a JSON object with these keys: 'title', 'description', 'actionText'.
  The 'description' should suggest or compliment user based on their statement where they are doing good or they can improve, try to keep atleast one of both.
  Personal Loan, Home Loan, FD/RD, Auto Loan, and Credit Card should get suggested at least once.
  The 'description' should also explain why the banner is relevant based on the statement analysis.
  Make sure the action text is attractive and user-engaging. it will be one or two words`;

const conversation = [
  {
    role: "user",
    content: [{ text: "Analyze my bank statement data." }],
  },
  {
    role: "assistant",
    content: [{ text: `${assistantPrompt}. please return output in a json with key output. Do not return anything except json. no plain text.` }],
  },
  {
    role: "user",
    content: [{ text: JSON.stringify(bank_statement) }],
  },
];

  

try {
  const BedrockRuntimeClient = require('@aws-sdk/client-bedrock-runtime').BedrockRuntimeClient;
  const client = new BedrockRuntimeClient({ region: REGION, credentials: {accessKeyId,secretAccessKey} });
  const ConverseCommand= require('@aws-sdk/client-bedrock-runtime').ConverseCommand


  let command, res;
  try {
    command = new ConverseCommand({
      modelId,
      messages: conversation,
      inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
    });
    res = await client.send(command);
  } catch(e) {
    return {
      statusCode: 202,
      body: JSON.stringify({"error":e})
    }
  }

  return {
    statusCode: 200,
    body: res.output.message.content[0].text,
  };
}
catch(e) {
  return {
    statusCode: 201,
    body: JSON.stringify({command, res})
  }
}
}catch(e) {
  return {
    statusCode: 210,
    body: JSON.stringify({"error:":e})
  }
}
}catch(e) {
  return {
    statusCode: 211,
    body: JSON.stringify({"error:":e,event, body, bank_statement})
  }
}

};
