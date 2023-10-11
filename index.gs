const labelMappings = {
    CountryCode: 'countryCode',
    ProfileYear: 'profile_year',
    ProgramType: 'team_type',
    ProgramName: 'program_code_display',
    ProgramNameFull: 'program_name',
    City: 'team_city',
    Country: 'team_country',
    FullName: 'team_name_calc',
    Nickname: 'team_nickname',
    TeamNumber: 'team_number_yearly',
    PostalCode: 'team_postalcode',
    RookieYear: 'team_rookieyear',
    StateProvince: 'team_stateprov',
};

const mapToLabel = (label) => labelMappings[label] ?? label;

const query = (teamNumber, competitionsString) => {
    PropertiesService.getScriptProperties().setProperty(
        'val',
        parseInt(PropertiesService.getScriptProperties().getProperty('val') ?? 0) + 1
    );
    console.log(`Execution #${PropertiesService.getScriptProperties().getProperty('val')}`);
    // {"match":{"team_type":"JFLL"}},{"match":{"team_type":"FLL"}},{"match":{"team_type":"FTC"}},{"match":{"team_type":"FRC"}}
    const qs = encodeURIComponent(
        `{"query":{"bool":{"must":[{"bool":{"should":[${competitionsString}]}}, {"match":{"team_number_yearly":"${teamNumber}"}}]}},"sort":"team_number_yearly"}`
    );
    const url = `https://es02.firstinspires.org/teams/_search?size=900&from=0&source_content_type=application/json&source=${qs}`; // may need to increase this 900

    const fetched = JSON.parse(UrlFetchApp.fetch(url).getContentText());

    return fetched;
};

const handleData = (fetched, labels, flags) => {
    const parsedFlags = parseFlags(flags);

    const year = parsedFlags?.year;
    const horizontal = JSON.parse(parsedFlags?.horizontal ?? 'true');

    const parsedLabels = handleArray(labels);

    if (!year) {
        const data = fetched.hits.hits.sort((a, b) => b._source.profile_year - a._source.profile_year)[0]._source;
        return pullRequestedData(data, parsedLabels, horizontal);
    }

    for (const l of fetched.hits.hits) {
        if (l._source.profile_year !== parseInt(year)) continue;

        const data = l._source;
        return pullRequestedData(data, parsedLabels, horizontal);
    }
};

const parseFlags = (flags) => {
    const regex = /--(\w+)=(?:[\"\']([^\"\'\\]*(?:\\.[^\\\'\"]*)*)[\"\']|(\w+))/g;

    const obj = {};

    for (const flag of (flags ?? '').matchAll(regex)) {
        obj[flag[1]] = flag[2] ?? flag[3];
    }
    return obj;
};

const formatMessage = (data, message) => {
    return message.replace(/\${(?<MATCH>.[^${}]*)}/g, (substr, label) => {
        return data[mapToLabel(label)] ?? '[No value found]';
    });
};

const pullRequestedData = (data, labels, horizontal) => {
    const ret = labels.map((e) => data[mapToLabel(e)]);
    return horizontal ? [ret] : ret;
};

const handleArray = (maybeArr) =>
    typeof maybeArr === 'string' ? [maybeArr] : typeof maybeArr[0] === 'string' ? maybeArr : maybeArr[0];

/**
 * Queries an FRC team with flags
 *
 * @param {number} teamNumber The number associated with the team
 * @param {string} labels Labels  in the form {"City", "Country", ...}
 *    Currently available: CountryCode, ProfileYear, ProgramType, ProgramName, ProgramNameFull, City, Country, FullName, Nickname, TeamNumber, PostalCode, RookieYear, StateProvince
 * @param {string} flags optional flags to add
 * @return the associated team value
 *
 * @customfunction
 */
async function FRCTEAMINFO(teamNumber, labels, flags) {
    return handleData(query(teamNumber, `{"match":{"team_type":"FRC"}}`), labels, flags);
}

/**
 * Queries an FTC team with flags
 *
 * @param {number} teamNumber The number associated with the team
 * @param {string} labels Labels  in the form {"City", "Country", ...}
 *    Currently available: CountryCode, ProfileYear, ProgramType, ProgramName, ProgramNameFull, City, Country, FullName, Nickname, TeamNumber, PostalCode, RookieYear, StateProvince
 * @param {string} flags optional flags to add
 * @return the associated team value
 *
 * @customfunction
 */
async function FTCTEAMINFO(teamNumber, labels, flags) {
    return handleData(query(teamNumber, `{"match":{"team_type":"FTC"}}`), labels, flags);
}

/**
 * Queries an FLL team with flags
 *
 * @param {number} teamNumber The number associated with the team
 * @param {string} labels Labels  in the form {"City", "Country", ...}
 *    Currently available: CountryCode, ProfileYear, ProgramType, ProgramName, ProgramNameFull, City, Country, FullName, Nickname, TeamNumber, PostalCode, RookieYear, StateProvince
 * @param {string} flags optional flags to add
 * @return the associated team value
 *
 * @customfunction
 */
async function FLLTEAMINFO(teamNumber, labels, flags) {
    return handleData(query(teamNumber, `{"match":{"team_type":"JFLL"}},{"match":{"team_type":"FLL"}}`), labels, flags);
}

function onOpen() {
    SpreadsheetApp.getUi().createAddonMenu().addItem('Add FIRST query', 'add').addToUi();
}

function add() {
    const title = 'FIRST Query Custom Functions';
    var message = 'FIRST API Query functions are now available in ' + 'this spreadsheet. ';
    var ui = SpreadsheetApp.getUi();
    ui.alert(title, message, ui.ButtonSet.OK);
}
