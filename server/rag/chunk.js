const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const pdf = require('pdf-parse');

/**
 * Extracts text from a PDF buffer and splits it into chunks.
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<Array>} - Array of text chunks with metadata.
 */
const processPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    const text = data.text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const output = await splitter.createDocuments([text]);
    
    // Enrich with basic metadata
    return output.map((doc, index) => ({
      pageContent: doc.pageContent,
      metadata: {
        chunkIndex: index,
        totalPages: data.numpages,
        info: data.info,
      },
    }));
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF document');
  }
};

module.exports = { processPDF };
