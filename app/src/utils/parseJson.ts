export default async function parseJson(jsonToParse: string) {
    const result = await JSON.parse(jsonToParse);

    return result;
}