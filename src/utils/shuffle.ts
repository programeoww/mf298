import IQuestion from "@/interfaces";

export default function shuffle(array: (string | number | string[] | IQuestion | null)[]) {
    if (array instanceof Array) {
        let currentIndex = array.length, randomIndex;

        while (currentIndex != 0) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    } else if (typeof array === 'object') {
        const newObject = Object.keys(array)
            .map((key) => ({ key, value: array[key] }))
            .sort((a, b) => b.key.localeCompare(a.key))
            .reduce((acc: any, e) => {
                acc[e.key] = e.value;
                return acc;
            }, {});
        return newObject;
    }
}