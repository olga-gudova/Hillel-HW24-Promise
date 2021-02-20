const urls = [
    'https://swapi.dev/api/starships/',
    'https://swapi.dev/api/films/',
];

const unPage = async (url) => {
    const resultArray = [];

    const auxiliary = async function(arg) {
        const data = await (await fetch(arg)).json();

        data.results.map((item) => {
            resultArray.push(item);
        });

        if (data.next) {
            await auxiliary(data.next);
        }
    };

    await auxiliary(url);

    return resultArray;
};

const requests = urls.map((url) => unPage(url));

(async () => {
    const data = await Promise.all(requests);
    const [ships, films] = data;

    function createList(array) {
        const $list = document.createElement('ul');
        array.forEach(el => {
            const $li = document.createElement('li');

            $li.textContent = el.name || el.title || el;
            $list.append($li);
        });
        return $list;
    }

    const extendedShips = ships.map(el => {
        const titles = [];
        el.films.forEach(element => {
            titles.push(...films.filter((item) => item.url === element));
            el.filmsNames = titles;
        });

        return el;
    });

    const $shipsList = createList(extendedShips);

    $shipsList.addEventListener('click', (e) => {
        const target = e.target.closest('li');

        if (!target) return;

        if (!target.children.length) {
            let $filmsList = 0;

            extendedShips.map((item) => {
                if (target.textContent === item.name) {
                    $filmsList = createList(item.filmsNames);
                }
            });

            target.append($filmsList);
        } else {
            Array.from(target.children).map((item) => {
                item.hidden = !item.hidden;
            });
        }
    });

    document.body.append($shipsList);
})();
