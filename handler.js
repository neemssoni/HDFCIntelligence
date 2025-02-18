


exports.hello = async (event) => {
  const fsPromises = require('fs').promises;
  const responseData= await fsPromises.readFile('response.json', 'utf-8');
  const responseDataJson = JSON.parse(responseData)
  
  return {
    statusCode: 200,
    body: JSON.stringify(responseDataJson),
  };
};

// exports.recommendations = async (event) => {
//   const fsPromises = require('fs').promises;
//   const responseData= await fsPromises.readFile('response.json', 'utf-8');
//   const responseDataJson = JSON.parse(responseData)
  
//   return {
//     statusCode: 200,
//     body: JSON.stringify(responseDataJson),
//   };
// };
