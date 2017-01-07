import 'isomorphic-fetch';
import csvToJson from 'csvtojson';
import leftPad from 'left-pad';

// Emoji_Sentiment_Data_v1.0.csv provides emoji sentiment data.
const defaultUrl = 'https://www.clarin.si/repository/xmlui/bitstream/handle/11356/1048/Emoji_Sentiment_Data_v1.0.csv?sequence=8&isAllowed=y';

export const internals = {
	defaultUrl,
};

export default function* SentimentData({ url = defaultUrl }) {
	const content = yield fetch(url).then(res => res.text());
	const csvParsed = new Promise((resolve, reject) => {
		csvToJson({ noheader: false }).fromString(content)
		.on('end_parsed', (csvData) => {
			resolve(csvData);
		})
		.on('error', (error) => {
			reject(error);
		});
	});
	const data = yield csvParsed;
	const transformedData = data.map(datum => ({
		sequence: leftPad(parseInt(datum['Unicode codepoint'], 16).toString(16), 4, 0).toUpperCase(),
		occurrences: datum.Occurrences,
		position: datum.Position,
		negative: datum.Negative,
		neutral: datum.Neutral,
		positive: datum.Positive,
	}));
	return { // API
		data: transformedData,
	};
}
