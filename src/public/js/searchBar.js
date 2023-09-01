const searchBar = document.getElementById('searchBar')
const listGroup = document.getElementById('teamsList')
let teamsList = []

searchBar.addEventListener("input", (e) => {
    const value = e.target.value
    const filteredTeams = teamsList.filter((team) => {
        if (value.match('^#+[0-9]{1,5}$')) {
            return value.substring(1).startsWith(team.id.toString())
        } else if (!value.startsWith('#')) {
            return team.team_name.startsWith(value)
        }
        return true;
    });
    displayTeams(filteredTeams);
})

const loadTeams = async () => {
    try {
        const res = await fetch('/api/teams')
        teamsList = await res.json()
        displayTeams(teamsList)
    } catch (err) {
        console.log(err)
    }
}

const displayTeams = (teams) => {
    const htmlString = teams.map((team) => {
        return `<li class="list-group-item">
        <div class="row g-0">
            <div class="col-sm-6">
                ${team.team_name}
                <p class="small_label"> #${team.id}</p>
            </div>
            <div class="col-6 d-flex justify-content-md-end">
                <form action="/teams/enterTeam" method="POST">
                <input type="hidden" name="id" id="id" value=${team.id} />
                    <button class="btn btn-primary select">
                        Entrar</button>
                </form>
            </div>
        </div>
    </li>
        `;
    }).join('');

    listGroup.innerHTML = htmlString
}

loadTeams();