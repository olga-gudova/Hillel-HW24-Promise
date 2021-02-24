class StarWars {
    STARSHIPS_URL = 'https://swapi.dev/api/starships/';

    starships = [];
    next = this.STARSHIPS_URL;
    films = new Map()

    constructor(loadButton, listParent) {
        this.loadButton = loadButton;
        this.listParent = listParent;

        this.initLoadEvent();
    }

    getData = async function(url) {
        const response = await fetch(url);
        const data = await response.json();

        return data;
    }

    initLoadEvent() {
        this.loadButton.addEventListener('click', async () => {
            const data = await this.getData(this.next);

            const { results: newStarships, next } = data;
            this.starships = [...this.starships, ...newStarships];
            this.next = next;

            if(!next) {
                this.loadButton.setAttribute('disabled', 'disabled');
            }

            this.renderListItems(this.starships, this.listParent);
            this.initItemEvent();
        });
    }

    initItemEvent() {
        this.listParent.addEventListener('click', async (e) => {
            const target = e.target.closest('.list__item');

            if (target) {
                if (!target.children.length) {
                    const shipName = target.innerText;

                    const { films: filmsLinks } = this.starships.find(x => x.name === shipName);

                    const films = await this.getFilms(filmsLinks);
                    this.renderInnerList(films, target);
                } else {
                    Array.from(target.children).forEach(item => item.remove());
                }
            }
        });
    }

    async getFilms(links) {
        const diff = [...new Set(links.filter(link => !this.films.has(link)))];
        const films = await Promise.all(diff.map(this.getData));
        this.setFilmsCache(links, films);

        const cachedFilmsLinks = links.filter(x => !diff.includes(x));
        const cachedFilms = cachedFilmsLinks.map(link => this.films.get(link));

        return [...films, ...cachedFilms];
    }

    setFilmsCache(links, filmsData) {
        links.forEach(async (link) => {
            if (!this.films.has(link)) {
                this.films.set(link, filmsData.find(x => x.url === link));
            }
        });
    }

    renderListItems = function(data, parent) {
        const fragment = document.createDocumentFragment();

        data.forEach(ship => {
            const li = document.createElement('li');
            li.classList.add('list__item');
            li.textContent = ship.name;
            fragment.appendChild(li);
        });

        parent.innerHTML = '';
        parent.prepend(fragment);
    }

    renderInnerList = function(data, parent) {
        const ul = document.createElement('ul');

        data.forEach(film => {
            const li = document.createElement('li');
            li.textContent = film.title;
            ul.append(li);
        });

        parent.append(ul);
    }
}

// eslint-disable-next-line no-unused-vars
const starWars = new StarWars(
    document.querySelector('.load-ships'),
    document.querySelector('.starships-list')
);