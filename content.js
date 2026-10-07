console.log('content script starts');

let listingKeys={
    'music':    ['url','album','barcode','albumAltName','artist0','artist1','artist2','genre','releaseType','media','date','label','numberOfDiscs','isrc','tracks','description','reference','imgUrl'],
    'movie':    ['url','type','name','chineseName','altName','imdb','director','screenwriter','cast0','cast1','cast2','genre','website','region','language','year','date','debutRegion','length','description','reference','imgUrl'],
    'game':     ['url','name','chineseName','platform','genre','date','description','reference','imgUrl'],
    'book':     []
}

// ====== Douban ====== 

class DoubanPage {

    constructor(){
        this.keys=null;
    }
 
    fill(listing) {
        //console.log(this.keys);
        for (let key of this.keys){
            let element=this.getElement(key) // an array: [element, elementType, elementParas]
            try{
                this.fillElement(element[2],element[0],element[1],listing[key])
            } catch(err){
                console.log("Can't fill "+key); 
            }
        }
    }

    getElement(key){
        throw "Not Implemented"
    } 

    findTextareaByLabel(labelText){
        for (let textarea of document.querySelectorAll('textarea')){
            let node=textarea.parentElement;
            for (let depth=0;node && depth<5;depth+=1,node=node.parentElement){
                if (node.textContent.includes(labelText) && node.querySelectorAll('textarea').length==1){
                    return textarea;
                }
            }

            let previous=textarea.previousElementSibling;
            while (previous){
                if (previous.textContent.includes(labelText)) return textarea;
                previous=previous.previousElementSibling;
            }
        }

        return null;
    }

    fillElement(element, elementType, elementParas,value){    
        // fill value to the web element
        switch (elementType){
            case 'text': // small textbox
            case 'textLarge': // large textbox
            case 'date': // date
                element.value=value;
                break;
            case 'dropdown': // dropdown 
                // console.log("check");
                try{
                    this.fillDropdown(element, value, elementParas);
                } catch {err} {
                    throw "Illegal dropdown parameter!";
                }
                
        }
    } 

    fillDropdown(dropdown, value, keys){
        // console.log("filling dropdown");
        let i=0;
        for (let key of keys){
            if (value==key) break;
            i+=1;
        }

        // console.log(i);
        if (i<keys.length) {
            dropdown.getElementsByClassName('options')[0].getElementsByClassName('sub')[i].click();
        }
    }

}

class DoubanMusicPage1 extends DoubanPage {

    constructor(){
        super();
        this.keys=listingKeys['music'];
        
    }

    getElement(key){
        switch (key){
            case 'album':   return ['text',null,document.getElementById('p_title')]
            case 'barcode': return ['text',null,document.getElementById('uid')]
        }
    }

    click(listing){
        console.log("clicking");
        let button;
        if (listing['barcode']){
            // console.log('have barcode');
            button=document.getElementsByClassName('submit')[0];
        } else{
            button=document.getElementsByClassName('btn-link')[0];
        }
        button.click(); 
    }
}


class DoubanMusicPage2 extends DoubanPage {
    constructor(){
        super();
        this.keys=listingKeys['music'];
        this.dropdownKeys={
            'genre':['Blues','Classical','EasyListening','Electronic','Folk','FunkSoulRnB','Jazz','Latin','Pop','Rap','Reggae' ,'Rock','Soundtrack','World'],
            'releaseType':['Album', 'Compilation','EP', 'Single','Bootleg', 'Video'],
            'media':['CD','Digital','Cassette','Vinyl']
        }
    }

    getElement(key){
        switch (key){
            case 'album': return ['text',null,document.getElementsByClassName('item basic')[0].getElementsByClassName('input_basic modified')];
            case 'date': return ['date',null,document.getElementsByClassName('item basic')[1].getElementsByClassName('datepicker input_basic hasDatepicker')[0]];
            case 'label': return ['text',null,document.getElementsByClassName('item basic')[2].getElementsByClassName('input_basic')[0]];
            case 'numberOfDiscs': return ['text',null,document.getElementsByClassName('item basic')[3].getElementsByClassName('input_basic')[0]];
            case 'isrc': return ['text',null,document.getElementsByClassName('item basic')[4].getElementsByClassName('input_basic')[0]];
            case 'albumAltName': return ['text',null,document.getElementsByClassName('item list')[0].getElementsByClassName('input_basic')[0]];
            case 'artist0': return ['text',null,document.getElementsByClassName('item list musicians')[0].getElementsByClassName('input_basic')[0]];
            case 'artist1': return ['text',null,document.getElementsByClassName('item list musicians')[0].getElementsByClassName('input_basic')[1]];
            case 'artist2': return ['text',null,document.getElementsByClassName('item list musicians')[0].getElementsByClassName('input_basic')[2]];
            case 'genre': return ['dropdown',this.dropdownKeys['genre'],document.getElementsByClassName('dropdown')[0]];
            case 'releaseType': return ['dropdown',this.dropdownKeys['releaseType'],document.getElementsByClassName('dropdown')[1]];
            case 'media': return ['dropdown',this.dropdownKeys['media'],document.getElementsByClassName('dropdown')[2]];
            case 'tracks': return ['textLarge',null,document.getElementsByClassName('item text section')[0].getElementsByClassName('textarea_basic')[0]];
            case 'description': return ['textLarge',null,document.getElementsByClassName('item text section')[1].getElementsByClassName('textarea_basic')[0]];
            case 'reference': return ['textLarge',null,this.findTextareaByLabel('参考资料')];
        }
    }
 
}

class DoubanMoviePage1 extends DoubanPage {
    constructor(){
        super();
        this.keys=listingKeys['movie'];
    }

    getElement(key){
        switch(key){
            case 'type': return ['movieCheckbox',null,document.getElementsByClassName('sub')];
            case 'name': return ['text',null,document.getElementById('p_title')];
            case 'imdb': return ['text',null,document.getElementById('p_uid')];
        }
    }
    click(listing){
        if (listing['imdb']){
            document.getElementsByName('subject_submit')[0].click();
        } else{
            document.getElementsByName("no_ud_submit")[0].click();
        }
    }

    fillElement(element, elementType, elementParas, value){ 
        console.log(value);
        switch(elementType){
            case 'movieCheckbox':
                console.log("check" + value);
                if (value=='movie'){
                    element[0].click();
                } else if (value=='tv'){
                    element[1].click();
                }
                break;
            default:
                super.fillElement(element,elementType, elementParas, value);
        }
    }
}

class DoubanMoviePage2 extends DoubanPage {
    constructor(){
        super();
        this.keys=listingKeys['movie'];
    }

    getElement(key){
        switch(key){
            case 'name': return ['text',null,document.getElementById('p_14')];
            case 'chineseName': return ['text',null,document.getElementById('p_95')];
            case 'altName': return ['text',null,document.getElementById('p_15_0')];
            case 'director': return ['text',null,document.getElementById('p_18_0')];
            case 'screenwriter': return ['text',null,document.getElementById('p_97_0')];
            case 'cast0': return ['text',null,document.getElementById('p_19_0')];
            case 'cast1': return ['text',null,document.getElementById('p_19_1')]; // TODO: multiple director/casts
            case 'cast2': return ['text',null,document.getElementById('p_19_2')];
            case 'genre': return ['movieDropdown',null, document.getElementsByClassName('opts-group')[0]]; // TODO
            case 'website': return ['text',null,document.getElementById('p_45')];
            case 'region': return ['movieDropdown',{'united states':'usa'},document.getElementsByClassName('opts-group')[1]];
            case 'language': return ['movieDropdown',null,document.getElementsByClassName('opts-group')[2]];
            case 'year': return ['text',null,document.getElementById('p_118')];
            case 'date': return ['text',null,document.getElementById('date_p_17_0')];
            case 'debutRegion': return ['text',null,document.getElementById('desc_p_17_0')];
            case 'length': return ['text',null,document.getElementById('p_119_0')];
            case 'description': return ['textLarge',null,document.getElementsByName('p_16_other')[0]];
            case 'reference': return ['textLarge',null,this.findTextareaByLabel('参考资料')];
        }
    }

    fillElement(element, elementType, elementParas,value){
        switch(elementType){
            case 'movieDropdown':
                let valueOriginal=value;
                value=value.toLowerCase();
                if (elementParas && elementParas[value]){
                    value=elementParas[value];
                }
                let removeCharacter=(str)=>{return str.substr(str.indexOf(' ')+1)};
                for (let option of element.getElementsByClassName('sub')){
                    if (removeCharacter(option.textContent.trim()).toLowerCase().trim()==value){
                        option.click();
                        return;
                    }
                }
                // none selected
                element.getElementsByClassName('selected')[0].textContent=valueOriginal;
                break;
            default: super.fillElement(element,elementType,elementParas, value)
        }
    }

}

// class DoubanBookPage1 extends DoubanPage {
//     keys=listingKeys['book'];
// }

// class DoubanBookPage2 extends DoubanPage {
//     keys=listingKeys['book'];
// }


class DoubanGamePage1 extends DoubanPage {
    constructor(){
        super();
        this.keys=listingKeys['game'];
    }

    getElement(key){
        switch(key) {
            case 'name': return ['text',null,document.getElementsByName('thing_name')[0]]
            default: return null
        }
    }

    click(listing=null){
        let button=document.getElementsByClassName('bn-flat1')[0];
        button.click();
    }
}

class DoubanGamePage2 extends DoubanPage {
    constructor(){
        super();
        this.keys=listingKeys['game'];
    }

    getElement(key){
        switch(key) {
            case 'name': return ['text',null,document.getElementsByName('thing_name')[0]];
            case 'chineseName': return ['text',null,document.getElementsByName('cn_name')[0]];
            case 'platform':
                const platformTranslator={'contains':false, 'data':{
                    'win':'PC', 'mac':'Mac','macOS':'Mac','linux':'Linux'
                }}
                return ['checkbox',platformTranslator,document.getElementsByClassName('checkbox-input')[0]];
            case 'genre': 
                const genreTranslator={'contains':true,'data':{ 
                    'action':'动作', 
                    'adventure':'冒险',
                    'sport':'体育','sports':'体育',
                    'rpg':'角色扮演','role-playing':'角色扮演',
                    'racing':'竞速',
                    'simulation':'模拟',
                    'fighting':'格斗',
                    'shooter':'射击','shooting':'射击',
                    'strategy':'即时战略','rts':'即时战略',
                    'card':'卡牌',
                    'massively multiplayer':'大型多人在线',
                    'puzzle':'益智',
                    'music':'音乐/旋律',
                    'first-person shooter':'第一人称射击','fps':'第一人称射击',
                    //光枪射击
                    'visual novel':'文字冒险'
                    //乱斗/清版
                    //横版过关
                }}
                return ['checkbox',genreTranslator,document.getElementsByClassName('checkbox-input')[1]];
            case 'date': return ['dateDropdown',null,document.getElementsByClassName("item-date")[0]];
            case 'description': return ['textLarge',null,document.getElementsByName("desc")[0]];
            case 'reference': return ['textLarge',null,this.findTextareaByLabel('参考资料')];
            default: return null;
        }
    }

    fillElement(element, elementType, elementParas,value){
        switch (elementType){
            case 'checkbox': 
                let checks=new Set();
                for (let vData of value){
                    for (let v in elementParas['data']){
                        if (elementParas['contains'] && vData.toLowerCase().includes(v.toLowerCase())){
                            checks.add(elementParas['data'][v]);
                        } else if ((!elementParas['contains']) && (vData.toLowerCase()==v.toLowerCase())){
                            checks.add(elementParas['data'][v]);
                        }
                    }
                }
                if (checks.size>0){
                    for (let box of element.querySelectorAll(".option-list,.pbox")){
                        if (checks.has(box.textContent.trim())){
                            box.children[0].click();
                        }
                    }
                }
                break;
            case 'dateDropdown': 
                let spl=value.split('-');
                if (spl.length!=3) throw "date format problem!"
                let boxes=element.getElementsByTagName('select');
                for (let i=0;i<3;i++){
                    boxes[i].value=parseInt(spl[i].trim()).toString();
                }
            default: super.fillElement(element, elementType, elementParas,value)
            
        }
    }
}


// ===== SourcePage ======

class SourcePage {
    constructor(){
        this.keys=null;
        this.data={};
        this.doubanLink=null;
    }

    collect(){
        console.log(this.keys);
        for (let key of this.keys){
            this.data[key]=null;
        }
        for (let key of this.keys){
            console.log(key);
            try {
                if (key=='reference'){
                    this.data[key]=this.getReferenceText();
                    continue;
                }
                this.data[key]=this.collectItem(key);
                if (key=='date') this.data[key]=this.formatDate(this.data[key]);
            } catch (err) {
                console.log("Error for collecting " + key);
                console.log(err);
            }
        }
        return this.data
    }

    collectItem(key){
        // I do it this way to make the data collection more robust to exceptions. 
    }

    getReferenceText(){
        return this.data.url || document.URL;
    }

    formatDate(dateStr) {
        // This is a general purpose formatter 
        // supported format: yyyy年mm月dd日; yyyy/mm/dd; mm/dd/yyyy; month/dd/yyyy; dd/month/yyyy; yyyy; month/yyyy; mm/yyyy； 
        try{
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
            let spl=dateStr.split(/ ?[, 年月日] ?/).filter(n=>n);
            const monthNameMap={"jan":"01","feb":"02","mar":"03","apr":"04","may":"05","jun":"06","jul":"07","aug":"08","sep":"09","oct":"10","nov":"11","dec":"12","january":"01","february":"02","march":"03","april":"04","may":"05","june":"06","july":"07","august":"08","september":"09","october":"10","november":"11","december":"12"}
            let month="01", day="01", year='null';
            if (spl.length==1){
                year=dateStr;
            } else if (spl.length==2){
                month=spl[0];
                year=spl[1];
            } else if (spl.length>=3){
                if (spl[0].match(/\d\d\d\d/)){
                    year=spl[0],month=spl[1],day=spl[2];
                } else {
                    year=spl[2];
                    month=spl[0];
                    day=spl[1]
                    if (monthNameMap[String(day).toLowerCase()]){
                        month=spl[1];
                        day=spl[0];
                    }
                }
            } else {return null;}
            
            month=month.padStart(2,'0').toLowerCase();
            if (monthNameMap[month]) month=monthNameMap[month];
            day=day.padStart(2,'0')
            return `${year}-${month}-${day}`;
        } catch(err){
            return null
        }
    }


}

class Bandcamp extends SourcePage {

    constructor(){
        super();
        this.keys=listingKeys['music'] // TODO: static variable
        this.doubanLink="https://music.douban.com/new_subject";
        this.data={}
    }

    getMetaContent(selector){
        let element=document.querySelector(selector);
        return element && element.content ? element.content.trim() : null;
    }

    cleanName(name){
        if (!name) return null;
        let cleaned=name
            .replace(/\s+/g, ' ')
            .replace(/^by\s+/i, '')
            .replace(/^music\s+by\s+/i, '')
            .trim();
        return cleaned || null;
    }

    splitNames(text){
        let cleaned=this.cleanName(text);
        if (!cleaned) return [];
        return cleaned.split(/,|、| & | and |\|/).map((name)=>this.cleanName(name)).filter((name)=>name);
    }

    getByLineArtists(text){
        if (!text) return [];
        let normalized=text.replace(/\s+/g, ' ').trim();
        let parts=normalized.split(/\bby\b/i);
        return this.splitNames(parts.length>1 ? parts[parts.length-1] : normalized);
    }

    getArtists(){
        let artists=Array.from(document.querySelectorAll('#name-section h3 a, #name-section [itemprop="byArtist"]'))
            .flatMap((element)=>this.splitNames(element.textContent))
            .filter((name)=>name);
        if (artists.length) return Array.from(new Set(artists));

        let nameSection=document.getElementById('name-section');
        if (nameSection){
            let h3=Array.from(nameSection.querySelectorAll('h3, .albumTitle, .trackTitle')).find((element)=>/\bby\b/i.test(element.textContent));
            artists=this.getByLineArtists(h3 && h3.textContent);
            if (artists.length) return Array.from(new Set(artists));
        }

        let metaArtist=this.getMetaContent('meta[property="music:musician"]')
            || this.getMetaContent('meta[name="twitter:audio:artist_name"]');
        artists=this.splitNames(metaArtist);
        if (artists.length) return Array.from(new Set(artists));

        let titleParts=(document.title || '').split('|').map((part)=>part.trim()).filter((part)=>part);
        if (titleParts.length>=2){
            artists=this.splitNames(titleParts[1]);
            if (artists.length) return Array.from(new Set(artists));
        }

        let accountName=this.getAccountName();
        return accountName ? [accountName] : [];
    }

    getAccountName(){
        let candidates=[
            '#band-name-location .title',
            '#band-name-location a',
            '#band-name-location span',
            '#band-name-location'
        ];

        for (let selector of candidates){
            let name=this.cleanName(document.querySelector(selector)?.textContent);
            if (name) return name;
        }

        return this.cleanName(this.getMetaContent('meta[property="og:site_name"]'));
    }

    getLabel(){
        let backLink=document.querySelector('.back-link-text');
        if (backLink){
            let lines=backLink.textContent.split('\n').map((line)=>this.cleanName(line)).filter((line)=>line);
            let label=lines
                .map((line)=>line.replace(/^(?:more\s*from|更多作品来自)\s*/i, '').trim())
                .find((line)=>line);
            if (label) return label;
        }

        let accountName=this.getAccountName();
        if (!accountName) return null;

        let firstArtist=this.getArtists()[0];
        if (firstArtist && accountName.toLowerCase()==firstArtist.toLowerCase()){
            return "Self-Released";
        }

        return accountName;
    }

    getReleaseDate(){
        let credits=document.querySelector('.tralbumData.tralbum-credits')?.textContent || '';
        let isoDate=credits.match(/\b\d{4}-\d{1,2}-\d{1,2}\b/);
        if (isoDate) return isoDate[0];

        let chineseDate=credits.match(/\d{4}年\d{1,2}月\d{1,2}日?/);
        if (chineseDate){
            let parts=chineseDate[0].match(/\d+/g);
            return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }

        return null;
    }

    getTracks(){
        let rows=Array.from(document.querySelectorAll('#track_table .track_row_view'));
        return rows.map((row, index)=>{
            let titleElement=row.querySelector('.title');
            if (!titleElement) return null;

            let title=titleElement.cloneNode(true);
            title.querySelectorAll('.time, .track-number, .info_link, .lyrics, .buy, .playbutton').forEach((element)=>element.remove());
            let name=title.textContent.replace(/\s+/g, ' ').replace(/^\d+\.?\s*/, '').trim();
            let duration=row.querySelector('.time')?.textContent.trim();
            if (!name) return null;
            return `${index+1}. ${name}${duration ? ' '+duration : ''}`;
        }).filter((track)=>track).join('\n') || null;
    }

    collectItem(key){  
        switch (key){
            case 'url'           : return document.URL;
            case 'album'         : return document.getElementById('name-section').children[0].textContent.trim();
            case 'barcode'       : return null;
            case 'albumAltName'  : return null;
            case 'artist0'       : 
            case 'artist1'       : 
            case 'artist2'       : 
                let i=parseInt(key.slice(-1));
                let artists=this.getArtists();
                if (i<artists.length) return artists[i];
                else return null;
            case 'genre'         : return 'Rock';
            case 'releaseType'   : return 'Album'; // TODO: infer by # of tracks
            case 'media'         : return 'Digital'; // Not labeled on Bandcamp
            case 'date'          : return this.getReleaseDate();
            case 'label'         : return this.getLabel();
            case 'numberOfDiscs' : return "1";
            case 'isrc'          : return null;
            case 'tracks': return this.getTracks();
            case 'description'   : 
                try {
                    return document.getElementsByClassName("tralbumData tralbum-about")[0].textContent.trim();
                } catch (err){return null;}
            case 'imgUrl'       : return document.getElementById('tralbumArt').children[0].href; 
        }
    }
}

class AppleMusic extends SourcePage {
    
    constructor(){
        super();
        this.keys=listingKeys['music'] // TODO: static variable
        this.doubanLink="https://music.douban.com/new_subject";
        this.data={}
    }

    getMetaContent(selector){
        let element=document.querySelector(selector);
        return element && element.content ? element.content.trim() : null;
    }

    getHeaderElement(){
        return document.querySelector('.album-header-metadata, .product-page-header, [data-testid="product-lockup"]') || document;
    }

    getAlbumTitle(){
        let titleElement=document.getElementById(collectButtonId)?.closest('h1, [data-testid="product-title"]')
            || this.getHeaderElement().querySelector('h1, [data-testid="product-title"]');
        if (titleElement){
            let clone=titleElement.cloneNode(true);
            clone.querySelector(`#${collectButtonId}`)?.remove();
            let title=clone.textContent.trim();
            if (title) return title;
        }

        return this.getMetaContent('meta[property="og:title"]');
    }

    getJsonLdObjects(){
        return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap((script)=>{
            try{
                let parsed=JSON.parse(script.textContent);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch(err){
                return [];
            }
        });
    }

    cleanArtistName(name){
        if (!name) return null;
        let cleaned=name.trim();
        if (!cleaned || /^https?:\/\//.test(cleaned)) return null;
        cleaned=cleaned.replace(/^在 Apple Music 上(聆听|收听)/, '').trim();
        return cleaned;
    }

    getArtistText(){
        let header=this.getHeaderElement();
        let titleElement=document.getElementById(collectButtonId)?.closest('h1, [data-testid="product-title"]')
            || header.querySelector('h1, [data-testid="product-title"]');
        let artistScope=titleElement?.parentElement || header;
        let artists=Array.from(header.querySelectorAll('a[href*="/artist/"]')).map((link)=>{
            return this.cleanArtistName(link.textContent)
                || this.cleanArtistName(link.getAttribute('aria-label'))
                || this.cleanArtistName(link.getAttribute('title'));
        }).filter((artist)=>artist);

        if (!artists.length){
            artists=Array.from(artistScope.querySelectorAll('a, [role="link"]')).map((link)=>{
                return this.cleanArtistName(link.textContent)
                    || this.cleanArtistName(link.getAttribute('aria-label'))
                    || this.cleanArtistName(link.getAttribute('title'));
            }).filter((artist)=>artist);
        }

        if (artists.length) return Array.from(new Set(artists)).join(',');

        let jsonLd=this.getJsonLdObjects().find((item)=>item.byArtist || item.artist);
        let jsonArtists=jsonLd?.byArtist || jsonLd?.artist;
        if (Array.isArray(jsonArtists)){
            artists=jsonArtists.map((artist)=>this.cleanArtistName(artist.name || artist)).filter((artist)=>artist);
        } else if (jsonArtists){
            artists=[this.cleanArtistName(jsonArtists.name || jsonArtists)].filter((artist)=>artist);
        }

        if (artists.length) return Array.from(new Set(artists)).join(',');

        let title=document.title || '';
        let titleMatch=title.match(/^(.+?)\s+-\s+(?:专辑|Album|Single|EP)\s+-\s+(.+?)\s+-\s+Apple Music/i)
            || title.match(/^(.+?)\s+由\s+(.+?)\s+演唱/i);
        if (titleMatch) return this.cleanArtistName(titleMatch[2]) || '';

        return this.cleanArtistName(this.getMetaContent('meta[property="music:musician"]')) || '';
    }

    normalizeDate(dateText){
        if (!dateText) return null;
        let text=String(dateText).trim();
        let iso=text.match(/\d{4}-\d{1,2}-\d{1,2}/);
        if (iso){
            let [year, month, day]=iso[0].split('-');
            return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
        }

        let chinese=text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (chinese){
            return `${chinese[1]}-${chinese[2].padStart(2,'0')}-${chinese[3].padStart(2,'0')}`;
        }

        return null;
    }

    getReleaseDate(){
        let jsonLd=this.getJsonLdObjects().find((item)=>item.datePublished);
        let jsonDate=this.normalizeDate(jsonLd?.datePublished);
        if (jsonDate) return jsonDate;

        let text=document.body.textContent.replace(/\s+/g, ' ');
        let fullDate=text.match(/\d{4}年\d{1,2}月\d{1,2}日/);
        let normalizedFullDate=this.normalizeDate(fullDate && fullDate[0]);
        if (normalizedFullDate) return normalizedFullDate;

        let iso=text.match(/\d{4}-\d{1,2}-\d{1,2}/);
        return this.normalizeDate(iso && iso[0]);
    }

    getLabel(){
        let candidates=Array.from(document.querySelectorAll('.bottom-metadata, [class*="copyright"], footer, main p, main span'))
            .map((element)=>element.textContent.replace(/\s+/g, ' ').trim())
            .filter((text)=>/^℗\s*\d{4}\s+/.test(text));
        let copyright=candidates.find((text)=>text.length<=120) || candidates[0];

        if (!copyright){
            let match=document.body.textContent.replace(/\s+/g, ' ').match(/℗\s*\d{4}\s+(.{1,160})/);
            copyright=match && match[0];
        }

        if (!copyright) return null;
        let label=copyright.replace(/^℗\s*\d{4}\s*/, '').trim();
        label=label.split(/(?:更多|出现在|你可能也喜欢|选择国家或地区|Copyright|©|℗)/)[0].trim();
        let westernLabel=label.match(/^.+?(?:LTD\.|LLC|INC\.|LIMITED|RECORDS|MUSIC|ENTERTAINMENT|COMPANY|CO\.)/i);
        if (westernLabel) label=westernLabel[0].trim();
        label=label.replace(/\s*(?:版权所有|All rights reserved).*$/i, '').trim();
        return label || null;
    }

    getCoverUrl(){
        let image=this.getHeaderElement().querySelector('source[srcset], img[srcset], img[src]');
        let rawUrl=null;
        if (image?.srcset){
            let sources=image.srcset.split(',').map((source)=>source.trim().split(/\s+/)[0]).filter((source)=>source);
            rawUrl=sources[sources.length-1];
        } else {
            rawUrl=image?.src || this.getMetaContent('meta[property="og:image"]');
        }

        if (!rawUrl) return null;
        return rawUrl.replace(/^\/\//, 'https://').replace(/\{w\}x\{h\}/, '1200x1200');
    }

    getElementText(element){
        if (!element) return null;
        let container=document.createElement('div');
        container.innerHTML=element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        return container.textContent
            .replace(/\r/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    cleanAlbumDescription(text){
        if (!text) return null;
        let cleaned=text
            .replace(/^Editors[’'] Notes\s*/i, '')
            .replace(/^编辑推荐\s*/i, '')
            .replace(/^专辑介绍[:：]?\s*/, '')
            .replace(/\s*(Show More|Show Less|更多|收起|展开)\s*$/i, '')
            .trim();
        return cleaned || null;
    }

    getAlbumDescription(){
        let selectors=[
            '.product-page-header .truncated-content-container',
            '.album-header-metadata .truncated-content-container',
            '[data-testid="product-lockup"] .truncated-content-container',
            '[data-testid="editorial-notes"]',
            '[data-testid="description"]',
            '[class*="editorial-notes"]',
            '[class*="description"] [class*="content"]'
        ];

        for (let selector of selectors){
            let text=this.cleanAlbumDescription(this.getElementText(document.querySelector(selector)));
            if (text) return text;
        }

        let jsonLd=this.getJsonLdObjects().find((item)=>item.description);
        let jsonDescription=this.cleanAlbumDescription(jsonLd?.description);
        if (jsonDescription) return jsonDescription;

        let metaDescription=this.cleanAlbumDescription(this.getMetaContent('meta[property="og:description"]') || this.getMetaContent('meta[name="description"]'));
        if (metaDescription) return metaDescription;

        return null;
    }

    collectItem(key){
        
        switch (key){
            case 'url': return document.URL;
            case 'album': return this.getAlbumTitle();
            case 'barcode': return null;
            case 'albumAltName': return null;
            case 'artist0':
            case 'artist1':
            case 'artist2':
                let i=parseInt(key.slice(-1));
                let artists=this.getArtistText();
                try{
                    return artists.split(/,|and/)[i].trim();
                } catch (err) {return null;}
            case 'genre': return 'Rock';
            case 'releaseType': return 'Album'; // TODO
            case 'media': return 'Digital';
            case 'date': return this.getReleaseDate();
            case 'label':
                return this.getLabel();
            case 'numberOfDiscs': return "1"; // TODO
            case 'isrc': return null;
            case 'tracks':
                let tracksText="";
                let songs=document.getElementsByClassName("songs-list")[0].getElementsByClassName('songs-list-row');
                let song;
                console.log("hre0");
                for (let i=0;i<songs.length;i++){
                    song=songs[i];
                    let songName='';
                    let songLength='';
                    try {
                        songName=song.getElementsByClassName('songs-list-row__song-name')[0].textContent.trim();
                    } catch (err) {}
                    try {
                        songLength=song.getElementsByClassName('songs-list-row__length')[0].textContent.trim();
                    } catch (err) {}
                    tracksText+=`${i+1}. ${songName} ${songLength}\n`;
                } 
                return tracksText
            case 'description':
                return this.getAlbumDescription();

            case 'imgUrl':
                return this.getCoverUrl();
        }
    }
}

class WebMusicPage extends SourcePage {
    constructor(){
        super();
        this.keys=listingKeys['music'];
        this.doubanLink="https://music.douban.com/new_subject";
        this.data={};
    }

    getMetaContent(selector){
        let element=document.querySelector(selector);
        return element && element.content ? element.content.trim() : null;
    }

    getJsonLdObjects(){
        return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap((script)=>{
            try{
                let parsed=JSON.parse(script.textContent);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch(err){
                return [];
            }
        });
    }

    splitArtists(text){
        if (!text) return [];
        return text.split(/,|、| \/ | & | and /).map((artist)=>artist.trim()).filter((artist)=>artist);
    }

    getArtistByIndex(key){
        let i=parseInt(key.slice(-1));
        let artists=this.getArtists();
        return i<artists.length ? artists[i] : null;
    }
}

class Spotify extends WebMusicPage {
    getAlbumData(){
        let jsonLd=this.getJsonLdObjects().find((item)=>String(item['@type'] || '').toLowerCase().includes('music'));
        return jsonLd || {};
    }

    getAlbumTitle(){
        let button=document.getElementById(collectButtonId);
        let titleFromButton=button?.previousElementSibling?.textContent.trim();
        if (titleFromButton) return titleFromButton;

        let metaTitle=this.getMetaContent('meta[property="og:title"]');
        let headings=Array.from(document.querySelectorAll('main h1, h1[data-encore-id="text"], h1'));
        let matchedHeading=headings.find((heading)=>heading.textContent.trim()===metaTitle);
        if (matchedHeading) return matchedHeading.textContent.trim();

        return document.querySelector('main h1')?.textContent.trim() || metaTitle || null;
    }

    getDescriptionParts(){
        let description=this.getMetaContent('meta[property="og:description"]') || '';
        return description.split('·').map((part)=>part.trim()).filter((part)=>part);
    }

    getArtists(){
        let data=this.getAlbumData();
        if (Array.isArray(data.byArtist)){
            return data.byArtist.map((artist)=>artist.name || artist).filter((artist)=>artist);
        }

        let parts=this.getDescriptionParts();
        let releaseTypeIndex=parts.findIndex((part)=>/^(Album|EP|Single)$/i.test(part));
        if (releaseTypeIndex>0){
            return this.splitArtists(parts.slice(0, releaseTypeIndex).join(', '));
        }

        let titleMatch=(document.title || '').match(/^(.+?) - (?:Album|Single|EP) by (.+?) \| Spotify$/i);
        return this.splitArtists(titleMatch && titleMatch[2]);
    }

    normalizeReleaseDate(text){
        if (!text) return null;
        text=String(text).trim();

        let iso=text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
        if (iso) return `${iso[1]}-${iso[2].padStart(2,'0')}-${iso[3].padStart(2,'0')}`;

        let fullMonth=text.match(/\b([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\b/);
        const monthNameMap={"jan":"01","feb":"02","mar":"03","apr":"04","may":"05","jun":"06","jul":"07","aug":"08","sep":"09","oct":"10","nov":"11","dec":"12","january":"01","february":"02","march":"03","april":"04","may":"05","june":"06","july":"07","august":"08","september":"09","october":"10","november":"11","december":"12"};
        if (fullMonth){
            let month=monthNameMap[fullMonth[1].toLowerCase()];
            if (month) return `${fullMonth[3]}-${month}-${fullMonth[2].padStart(2,'0')}`;
        }

        let year=text.match(/\b(19|20)\d{2}\b/);
        return year ? `${year[0]}-01-01` : null;
    }

    getReleaseDate(){
        let data=this.getAlbumData();
        let jsonDate=this.normalizeReleaseDate(data.datePublished);
        if (jsonDate) return jsonDate;

        let parts=this.getDescriptionParts();
        let datePart=parts.find((part)=>/\b\d{4}(?:-\d{1,2}-\d{1,2})?\b/.test(part));
        let partDate=this.normalizeReleaseDate(datePart);
        if (partDate) return partDate;

        let metaDate=this.normalizeReleaseDate(this.getMetaContent('meta[property="music:release_date"]'))
            || this.normalizeReleaseDate(this.getMetaContent('meta[name="music:release_date"]'));
        if (metaDate) return metaDate;

        let timeDate=Array.from(document.querySelectorAll('time[datetime], [datetime]'))
            .map((element)=>this.normalizeReleaseDate(element.getAttribute('datetime') || element.textContent))
            .find((date)=>date);
        if (timeDate) return timeDate;

        let bodyText=(document.querySelector('main') || document.body).textContent.replace(/\s+/g, ' ');
        let releasedMatch=bodyText.match(/(?:Released|Release date)\s+([A-Za-z]+\s+\d{1,2},\s*\d{4}|\d{4}-\d{1,2}-\d{1,2}|\d{4})/i);
        if (releasedMatch) return this.normalizeReleaseDate(releasedMatch[1]);

        return null;
    }

    getLabel(){
        let copyrightElements=Array.from(document.querySelectorAll('main *')).map((element)=>element.textContent.trim()).filter((text)=>/^[©℗]/.test(text));
        let copyrightText=copyrightElements.find((text)=>text.includes('℗')) || copyrightElements[0];
        if (!copyrightText) return null;

        return copyrightText.replace(/^[©℗]\s*/, '').replace(/^\d{4}\s*/, '').trim() || null;
    }

    getTrackTitle(row){
        let link=row.querySelector('a[href*="/track/"]');
        let title=link?.textContent.trim();
        if (title) return title;

        let artists=this.getArtists().filter((artist)=>artist).sort((a,b)=>b.length-a.length);
        let text=row.textContent.replace(/\s+/g,' ').trim();
        let duration=(text.match(/(\d{1,2}:\d{2})(?!.*\d{1,2}:\d{2})/) || [null, ''])[1];

        text=text.replace(/^\d+\.?\s*/, '').trim();
        if (duration) text=text.slice(0, text.lastIndexOf(duration)).trim();
        for (let artist of artists){
            text=text.replace(new RegExp(artist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+'$', 'i'), '').trim();
        }
        return text || null;
    }

    getTrackDuration(row){
        let durationElement=row.querySelector('[data-testid="track-duration"]');
        let duration=durationElement?.textContent.trim();
        if (duration) return duration;

        let match=row.textContent.match(/(\d{1,2}:\d{2})(?!.*\d{1,2}:\d{2})/);
        return match && match[1];
    }

    getCoverUrl(){
        let titleElement=document.getElementById(collectButtonId)?.previousElementSibling;
        let container=titleElement?.closest('main section, main');
        let image=container?.querySelector('img[src*="i.scdn.co"], img[srcset*="i.scdn.co"]')
            || document.querySelector('main img[src*="i.scdn.co"], main img[srcset*="i.scdn.co"]');

        if (image?.srcset){
            let sources=image.srcset.split(',').map((source)=>source.trim().split(/\s+/)[0]).filter((source)=>source);
            if (sources.length) return sources[sources.length-1];
        }

        return image?.src || this.getMetaContent('meta[property="og:image"]');
    }

    collectItem(key){
        switch(key){
            case 'url': return document.URL;
            case 'album': return this.getAlbumTitle();
            case 'barcode': return null;
            case 'albumAltName': return null;
            case 'artist0':
            case 'artist1':
            case 'artist2':
                return this.getArtistByIndex(key);
            case 'genre': return 'Rock';
            case 'releaseType': return 'Album';
            case 'media': return 'Digital';
            case 'date': return this.getReleaseDate();
            case 'label': return this.getLabel();
            case 'numberOfDiscs': return '1';
            case 'isrc': return null;
            case 'tracks':
                return Array.from(document.querySelectorAll('[data-testid="tracklist-row"]')).map((row, index)=>{
                    let title=this.getTrackTitle(row);
                    let duration=this.getTrackDuration(row);
                    if (!title) return null;
                    return `${index+1}. ${title}${duration ? ' '+duration : ''}`;
                }).filter((track)=>track).join('\n') || null;
            case 'description':
                return null;
            case 'imgUrl':
                return this.getCoverUrl();
        }
    }
}

class NetEaseMusic extends WebMusicPage {
    getAlbumContainer(){
        return document.querySelector('.cnt') || document;
    }

    getArtists(){
        let container=this.getAlbumContainer();
        let artistParagraph=Array.from(container.querySelectorAll('p')).find((item)=>/歌手|艺术家/.test(item.textContent));
        if (artistParagraph){
            let artists=Array.from(artistParagraph.querySelectorAll('a[href*="/artist?id="]')).map((link)=>link.textContent.trim()).filter((artist)=>artist);
            if (artists.length) return Array.from(new Set(artists));
        }

        let title=this.getMetaContent('meta[property="og:title"]') || document.title || '';
        let parts=title.split(/ - | -/).map((part)=>part.trim()).filter((part)=>part);
        if (parts.length>=2){
            return this.splitArtists(parts[1].replace(/网易云音乐.*/,'').trim());
        }

        let artistLinks=Array.from(container.querySelectorAll('a[href*="/artist?id="]')).map((link)=>link.textContent.trim()).filter((artist)=>artist);
        return Array.from(new Set(artistLinks));
    }

    getInfoValue(label){
        let container=this.getAlbumContainer();
        let paragraphs=Array.from(container.querySelectorAll('p'));
        let paragraph=paragraphs.find((item)=>item.textContent.includes(label));
        if (!paragraph) return null;

        return paragraph.textContent
            .replace(new RegExp(`.*${label}[:：]\\s*`), '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    getTrackTitle(row){
        let title=row.querySelector('.txt a b')?.getAttribute('title')
            || row.querySelector('.txt a b')?.textContent
            || row.querySelector('.txt a')?.getAttribute('title')
            || row.querySelector('.txt a')?.textContent
            || row.querySelector('a[href*="/song?id="]')?.textContent;
        return title ? title.replace(/\s*分享\s*$/,'').trim() : null;
    }

    getTrackDuration(row){
        let duration=row.querySelector('.u-dur')?.textContent.trim()
            || Array.from(row.children).map((cell)=>cell.textContent.trim()).find((text)=>/^\d{1,2}:\d{2}$/.test(text));
        return duration || null;
    }

    getElementText(element){
        if (!element) return null;
        let container=document.createElement('div');
        container.innerHTML=element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        return container.textContent
            .replace(/\r/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    getAlbumDescription(){
        let selectors=[
            '#album-desc-more',
            '#album-desc-dot',
            '.n-albdesc .f-brk',
            '.n-albdesc',
            '.cnt .intr'
        ];

        for (let selector of selectors){
            let text=this.getElementText(document.querySelector(selector));
            if (!text) continue;
            text=text
                .replace(/^专辑介绍[:：]?\s*/, '')
                .replace(/\s*(收起|展开|更多)\s*$/g, '')
                .trim();
            if (text) return text;
        }

        let container=this.getAlbumContainer();
        let heading=Array.from(container.querySelectorAll('h3, h4, strong, b')).find((item)=>item.textContent.includes('专辑介绍'));
        if (heading){
            let text=this.getElementText(heading.parentElement);
            if (text){
                return text.replace(/^专辑介绍[:：]?\s*/, '').trim() || null;
            }
        }

        let metaDescription=this.getMetaContent('meta[name="description"]') || '';
        metaDescription=metaDescription
            .replace(/^.*?专辑介绍[:：]\s*/, '')
            .replace(/\s*。?\s*网易云音乐.*$/,'')
            .trim();
        if (metaDescription) return metaDescription;

        return null;
    }

    getReleaseDate(){
        let text=this.getInfoValue('发行时间') || '';
        let iso=text.match(/\d{4}-\d{1,2}-\d{1,2}/);
        if (iso) return iso[0];

        let chinese=text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (chinese){
            return `${chinese[1]}-${chinese[2].padStart(2,'0')}-${chinese[3].padStart(2,'0')}`;
        }

        return null;
    }

    collectItem(key){
        switch(key){
            case 'url': return document.URL;
            case 'album':
                return document.querySelector('.cnt h2, h2.f-ff2, h2')?.textContent.trim()
                    || (this.getMetaContent('meta[property="og:title"]') || '').split(/ - | -/)[0].trim();
            case 'barcode': return null;
            case 'albumAltName': return null;
            case 'artist0':
            case 'artist1':
            case 'artist2':
                return this.getArtistByIndex(key);
            case 'genre': return 'Rock';
            case 'releaseType': return 'Album';
            case 'media': return 'Digital';
            case 'date': return this.getReleaseDate();
            case 'label': {
                return this.getInfoValue('发行公司');
            }
            case 'numberOfDiscs': return '1';
            case 'isrc': return null;
            case 'tracks':
                return Array.from(document.querySelectorAll('.m-table tbody tr, .song-list tbody tr')).map((row, index)=>{
                    let title=this.getTrackTitle(row);
                    let duration=this.getTrackDuration(row);
                    if (!title) return null;
                    return `${index+1}. ${title}${duration ? ' '+duration : ''}`;
                }).filter((track)=>track).join('\n') || null;
            case 'description':
                return this.getAlbumDescription();
            case 'imgUrl':
                return this.getMetaContent('meta[property="og:image"]') || document.querySelector('.u-cover img, img[src*="music.126.net"]')?.src;
        }
    }
}

class Discogs extends SourcePage {
    constructor(){
        super();
        this.keys=listingKeys['music'] // TODO: static variable
        this.doubanLink="https://music.douban.com/new_subject";
        this.data={}
    }

    getMetaContent(selector){
        let element=document.querySelector(selector);
        return element && element.content ? element.content.trim() : null;
    }

    cleanText(text){
        return text ? text.replace(/\s+/g, ' ').trim() : null;
    }

    getElementText(element){
        if (!element) return null;
        let container=document.createElement('div');
        container.innerHTML=element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        return container.textContent
            .replace(/\r/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    getProfilePairs(){
        let pairs=[];
        let profile=document.querySelector('.profile');
        if (profile){
            let children=Array.from(profile.children);
            for (let i=0;i<children.length-1;i+=1){
                let key=this.cleanText(children[i].textContent || '').replace(/:$/, '');
                let value=this.cleanText(children[i+1].textContent || '');
                if (/^(Label|Format|Country|Released|Genre|Style|Year)$/i.test(key) && value){
                    pairs.push([key, value]);
                }
            }
        }

        let header=document.getElementById('release-header');
        let detailRows=header ? Array.from(header.querySelectorAll('div, li, tr')) : [];
        for (let row of detailRows){
            let text=this.cleanText(row.textContent || '');
            let match=text && text.match(/^(Label|Format|Country|Released|Genre|Style|Year):\s*(.+)$/i);
            if (match) pairs.push([match[1], match[2]]);
        }

        for (let row of document.querySelectorAll('[class*="profile"] tr, [class*="info"] tr')){
            let cells=Array.from(row.children).map((cell)=>this.cleanText(cell.textContent));
            if (cells.length>=2 && /^(Label|Format|Country|Released|Genre|Style|Year)$/i.test(cells[0].replace(/:$/, ''))){
                pairs.push([cells[0].replace(/:$/, ''), cells.slice(1).join(' ')]);
            }
        }

        return pairs;
    }

    getProfileValue(label){
        let pair=this.getProfilePairs().find(([key])=>key.toLowerCase()==label.toLowerCase());
        return pair ? pair[1] : null;
    }

    getLabel(){
        let label=this.getProfileValue('Label');
        if (!label) return null;
        label=label
            .replace(/\s*–\s*.+$/, '')
            .replace(/\s*,\s*.+$/, '')
            .replace(/\(\d+\)/g, '')
            .trim();
        return label || null;
    }

    getReleaseDate(){
        return this.getProfileValue('Released') || this.getProfileValue('Year');
    }

    getIdentifierRows(){
        let rows=[];
        let selectors=[
            '#release-barcodes tr',
            '#release-barcodes li',
            '#release-identifiers tr',
            '#release-identifiers li',
            '[class*="barcode"] tr',
            '[class*="barcode"] li',
            '[class*="identifier"] tr',
            '[class*="identifier"] li'
        ];

        for (let selector of selectors){
            rows.push(...Array.from(document.querySelectorAll(selector)).map((row)=>this.cleanText(row.textContent)).filter((text)=>text));
        }

        let headings=Array.from(document.querySelectorAll('h2, h3, h4')).filter((heading)=>/Barcode and Other Identifiers|Identifiers/i.test(heading.textContent));
        for (let heading of headings){
            let container=heading.parentElement;
            if (container){
                rows.push(...Array.from(container.querySelectorAll('li, tr, div')).map((row)=>this.cleanText(row.textContent)).filter((text)=>text));
            }
        }

        return Array.from(new Set(rows));
    }

    getISRC(){
        let rows=this.getIdentifierRows();
        let isrcRows=rows.filter((row)=>/\bISRC\b/i.test(row));
        let codes=isrcRows.flatMap((row)=>{
            let matches=row.match(/[A-Z]{2}[A-Z0-9]{3}\d{7}/gi);
            if (matches) return matches;
            return row.replace(/.*?\bISRC\b[:\s-]*/i, '').split(/[,;/\n]/).map((part)=>part.trim()).filter((part)=>part);
        });
        return Array.from(new Set(codes)).join(', ') || null;
    }

    getDescription(){
        let selectors=[
            '#notes',
            '#release-notes',
            '[data-testid="release-notes"]',
            '[class*="notes"]'
        ];

        for (let selector of selectors){
            let element=document.querySelector(selector);
            if (!element) continue;
            let text=this.getElementText(element);
            text=text && text.replace(/^Notes\s*/i, '').trim();
            if (text) return text;
        }

        return this.getMetaContent('meta[name="description"]') || this.getMetaContent('meta[property="og:description"]');
    }

    collectItem(key){
        switch(key){
            case 'url': return document.URL;
            case 'album': 
                try {
                    return document.getElementById('profile_title').children[1].textContent.trim();
                } catch(err){
                    return document.getElementsByTagName('h1')[0].textContent.split('–')[1].trim();
                }
            case 'barcode': return null; // TODO
            case 'albumAltName': return null;
            case 'artist0':
            case 'artist1':
            case 'artist2':
                let i=parseInt(key.slice(-1));
                try{
                    let artists=document.getElementsByClassName('profile')[0].children[0].children[0].children
                    if (i<artists.length) return artists[i].title.replace(/(\(\d+\))/,'').trim();
                    else return null
                } catch (err) {
                    let artists=document.getElementsByTagName('h1')[0].getElementsByTagName('span');
                    if (i<artists.length) return artists[i].textContent.replace(/(\(\d+\))/,'').trim();
                    else return null;
                }
            case 'genre': return 'Rock';
            case 'date': return this.getReleaseDate();
            case 'media': return 'Vinyl';
            case 'label': return this.getLabel();
            
            case 'releaseType': return 'Album'; // TODO: detect single/ep/album by # of tracks
            case 'numberOfDiscs': return '1';
            case 'isrc': return this.getISRC();
            case 'tracks':
                let tracks,trackText;
                let trackPos, trackArtist, trackTitle, trackDur;
                try{
                    // logged in, master or release; or not logged in, master page
                    tracks=document.getElementById('tracklist').getElementsByTagName('tr');
                    trackText="";
                    for (let i=0;i< tracks.length;i++){
                        let track=tracks[i]
                        trackPos=(i+1).toString();
                        if (track.getAttribute('data-track-position')){
                            trackPos=track.getAttribute('data-track-position');
                        }
                        let es=track.getElementsByClassName("tracklist_track_pos")
                        if (es.length>0) trackPos=es[0].textContent.trim();
                        trackTitle=''
                        es=track.getElementsByClassName("tracklist_track_title")
                        if (es.length>0) trackTitle=es[0].textContent.trim();
                        trackDur=''
                        es=track.getElementsByClassName("tracklist_track_duration")
                        if (es.length>0) trackDur=es[0].textContent.trim();
                        trackText+=`${trackPos} - ${trackTitle} ${trackDur}\n`
                    }
                } catch(err){
                    // not logged in, release page
                    tracks=document.getElementById('release-tracklist').getElementsByTagName('tr');
                    trackText='';
                    for (let i=0;i< tracks.length;i++){
                        let track=tracks[i];
                        trackPos=(i+1).toString();
                        if (track.getAttribute('data-track-position')){
                            trackPos=track.getAttribute('data-track-position');
                        } else {
                            trackText+=(track.textContent.trim()+'\n');
                            continue;
                        }
                        console.log("hello");
                        trackArtist='';
                        trackTitle='';
                        trackDur='';
                        for (let ele of track.children){
                            try{
                                if (ele.className.startsWith("artist") && ele.textContent.trim()){
                                    trackArtist=ele.children[0].textContent.trim()+' - ';
                                } else if (ele.className.startsWith("trackTitle")){
                                    trackTitle=ele.children[0].textContent.trim()
                                } else if (ele.className.startsWith("duration")){
                                    trackDur=' '+ele.textContent.trim();
                                }
                            } catch (err){}
                        }
                        trackText+=`${trackPos}. ${trackArtist}${trackTitle}${trackDur}\n`
                    }

                }
                 
                return trackText;

            case 'description':
                return this.getDescription();

            case 'imgUrl':
                try{
                    return JSON.parse(document.getElementById('page_content').getElementsByClassName("image_gallery")[0].attributes['data-images'].nodeValue)[0]['full'];
                } catch(err){
                    return document.querySelector('[property="og:image"]').content;
                }
        }
    }
    
}

// class Soundcloud extends SourcePage {
//     keys=listKeys['music'];
// }

class IMDB extends SourcePage {
    constructor(){
        super();
        this.keys=listingKeys['movie'];
        this.doubanLink="https://movie.douban.com/new_subject";
    }
    
    collectItem(key){
        let ele;
        let match;
        let i;
        switch(key){
            case 'url': return document.URL;
            case 'type': 
                ele=document.querySelector('[data-testid="hero-title-block__metadata"]');
                if (ele.children[0].textContent.trim().startsWith('TV')) return 'tv';
                else return 'movie';
            case 'name': return document.getElementsByTagName('h1')[0].textContent.trim();
            case 'chineseName': return null;
            case 'altName': 
                try{
                    return this.parseLine('title-details-akas')[0];
                } catch(err) {return null;}
            case 'imdb': 
                match=document.URL.match(/\/title\/(.+)\//);
                return match && match[1];
            case 'director':
                key='Director';
            case 'screenwriter':
                key='Writer';
                try{
                    for (let section of [document.getElementsByClassName('ipc-metadata-list--base')[0].children,document.querySelector('[data-testid="title-pc-wide-screen"]').getElementsByClassName("ipc-metadata-list__item"),document.querySelector('[data-testid="title-pc-expandable-panel"]').getElementsByClassName("ipc-metadata-list__item")]){
                        for (let row of section){
                            if (row.children[0].textContent.trim().startsWith(key)){
                                return this.parseLine(row)[0];
                            }
                        }
                    }
                } catch (err) {}
                return null;
            case 'cast0':
            case 'cast1':
            case 'cast2':
                i=parseInt(key.slice(-1));
                try{
                    return document.querySelectorAll("[data-testid='title-cast-item__actor']")[i].textContent.trim(); // TODO: add more actors
                } catch (err){
                    return null;
                }
            case 'genre': return this.parseLine("storyline-genres")[0];
            case 'website': return document.querySelector('[data-testid="title-details-officialsites"]').getElementsByClassName('ipc-inline-list__item')[0].children[0].href.trim();
            case 'region': return this.parseLine("title-details-origin")[0];
            case 'language': return this.parseLine("title-details-languages")[0];
            case 'year': 
                ele=document.querySelector('[data-testid="hero-title-block__metadata"]');
                if (this.collectItem('type')=='tv') return ele.children[1].textContent.trim().split('–')[0].trim();
                else return ele.children[0].children[0].textContent.trim();
            case 'date':
                return this.parseLine("title-details-releasedate")[0].split(" (")[0];
            case 'debutRegion':
                match=this.parseLine("title-details-releasedate")[0].match(/\((.*)\)/);
                return match && match[1];
            case 'length':
                return this.parseLine("title-techspec_runtime")[0];
            case 'description':
                try{
                    return document.querySelector('[data-testid="storyline-plot-summary"]').textContent.trim();
                } catch (err) {return null;}
            case 'imgUrl':
                return document.querySelector('[data-testid="hero-media__poster"]').getElementsByTagName('img')[0].srcset.split(', ').slice(-1)[0].trim().split(' ')[0].trim();
        }
    }

    parseLine(val){
        if (typeof val === 'string' || val instanceof String){
            val=document.querySelector('[data-testid="'+val+'"]');
        }
        return Array.from(val.getElementsByClassName("ipc-inline-list__item")).map((ele)=>{return ele.textContent.trim()});
    }
}

class Steam extends SourcePage {
    constructor(){
        super();
        this.keys=listingKeys['game'];
        this.doubanLink="https://www.douban.com/game/create";
        this.data={};
    }

    collectItem(key){
        switch (key){
            case 'url': return document.URL;
            case 'name': return document.getElementById('appHubAppName').textContent.trim();
            case 'chineseName': return this.collectItem('name');
            case 'platform': 
                try{
                    return Array.from(document.getElementsByClassName("game_area_purchase_platform")[0].children).map((ele)=>{return ele.classList[1].trim();}); // win, mac, linux
                } catch (err) {return 'win'};
            case 'genre': 
                for (let text of document.getElementById("genresAndManufacturer").textContent.trim().split(/[\n\t]+/)){
                    if (text.startsWith('Genre:')){
                        text=text.replace('Genre:','').trim();
                        return text.split(/ ?, ?/).map((ele)=>{return ele.trim()});
                    }
                }
                return null
            case 'date':
                for (let text of document.getElementById("genresAndManufacturer").textContent.trim().split(/[\n\t]+/)){
                    if (text.startsWith('Release Date:')){
                        text=text.replace('Release Date:','').trim();
                        return text;
                    }
                }
                return null
            case 'description': return document.getElementsByClassName("game_description_snippet")[0].textContent.trim();
            case 'imgUrl': return document.getElementsByClassName("game_header_image_full")[0].src.trim();
        }
    }
}

// class AmazonBook extends SourcePage {
//     keys=listKeys['book'];
// }



// ====== Main ======


// console.log("Testing plugin");
// console.log(getCurrentPage());


let getCurrentPage=()=>{
    // Get current page 
    let match=document.URL.match(/([\w]+)\.com/);
    let site=match && match[1];

    switch(site){
        case 'douban':
            if (document.URL.includes('music')){
                let nBasic=document.getElementsByClassName('basic').length;
                if (nBasic==2) return 'doubanMusic1';
                else if (nBasic>2) return 'doubanMusic2';
                else return null;
            } else if (document.URL.includes('game')){
                if (document.getElementsByClassName('create-input').length>=1) return 'doubanGame1';
                else if (document.getElementsByClassName("single-input").length>=2) return 'doubanGame2';
                else return null;
            } else if (document.URL.includes('movie')){
                if (document.getElementsByClassName('item basic').length<=4) return 'doubanMovie1';
                else return 'doubanMovie2';
            } else return null;
        case 'steampowered':
            return 'steam';
        case 'spotify':
            return document.URL.includes('/album/') ? 'spotify' : null;
        case '163':
            return document.URL.includes('/album') ? 'netease' : null;
        case 'bandcamp':
        case 'discogs':
        case 'soundcloud':
        case 'apple':
        case 'imdb':
            return site;
        default:
            return null;
    }
}

const localStorageID='DoubanListingData';


const collectButtonId='douban-listing-helper-button';
const collectButtonStyleId='douban-listing-helper-button-style';

let createButton = (currentPage, attempt=0)=>{
    if (document.getElementById(collectButtonId)) return;

    const ensureCollectButtonStyle=()=>{
        if (document.getElementById(collectButtonStyleId)) return;

        const style=document.createElement('style');
        style.id=collectButtonStyleId;
        style.textContent=`
            #${collectButtonId} {
                background: #ffffff;
                border: 1px solid #bdbdbd;
                border-radius: 3px;
                color: #0687f5;
                cursor: pointer;
                font-size: 12px;
                font-weight: 700;
                line-height: 1.2;
                margin-left: 0;
                padding: 6px 12px;
                position: relative;
                top: -6px;
                vertical-align: top;
            }

            #${collectButtonId}:hover {
                background: #f5f5f5;
                border-color: #999999;
                color: #0687f5;
            }

            #${collectButtonId}:active {
                background: #eeeeee;
                border-color: #888888;
            }

            #${collectButtonId}.steam-title-button {
                margin-left: 12px;
                top: 0;
                vertical-align: middle;
            }

            #${collectButtonId}.imdb-title-button {
                margin-left: 0;
                margin-right: 0;
                top: 0;
                vertical-align: middle;
            }

            #${collectButtonId}.netease-title-button {
                margin-left: 12px;
                top: 0;
                vertical-align: middle;
            }

            #${collectButtonId}.apple-title-button {
                margin-left: 12px;
                top: 0;
                vertical-align: middle;
            }
        `;
        document.head.appendChild(style);
    };

    const handleCollectClick=(event)=>{
        if (event){
            event.preventDefault();
            event.stopPropagation();
        }

        console.log("button clicked. ")

        let page;
        
        switch (currentPage){
            case 'bandcamp':
                page=new Bandcamp();
                break;
            case 'discogs': 
                page=new Discogs();
                break;
            case 'apple':
                page=new AppleMusic();
                break;
            case 'spotify':
                page=new Spotify();
                break;
            case 'netease':
                page=new NetEaseMusic();
                break;
            case 'steam':
                page=new Steam();
                break;
            case 'imdb':
                page=new IMDB();
                break;
        }
        console.log("button clicked. ")
        try{
            let data=page.collect();
            console.log(currentPage + JSON.stringify(data));
            browser.runtime.sendMessage({page:currentPage,data: JSON.stringify(data)});
            console.log(data);
            window.open(page.doubanLink);
        } catch(err) {console.log(err);}
    };

    const getTitleElement=()=>{
        switch (currentPage){
            case 'bandcamp':
                return document.querySelector('#name-section h2, #name-section .trackTitle, h2.trackTitle');
            case 'apple':
                return document.querySelector('.album-header-metadata h1, [data-testid="product-title"], h1');
            case 'discogs':
                return document.querySelector('#profile_title, #release-title, h1');
            case 'steam':
                return document.getElementById('appHubAppName');
            case 'imdb':
                return document.querySelector('h1[data-testid="hero__pageTitle"], h1');
            case 'spotify':
                {
                    let albumTitle=document.querySelector('meta[property="og:title"]')?.content?.trim();
                    let headings=Array.from(document.querySelectorAll('main h1, h1[data-encore-id="text"], h1'));
                    return headings.find((heading)=>heading.textContent.trim()===albumTitle)
                        || document.querySelector('main [data-testid="entityTitle"], main h1')
                        || null;
                }
            case 'netease':
                return document.querySelector('.cnt h2, h2.f-ff2, h2');
            default:
                return null;
        }
    };

    const createTitleButton=(titleElement)=>{
        ensureCollectButtonStyle();

        const button=document.createElement("button");
        button.id=collectButtonId;
        button.textContent="采集";
        titleElement.style.display="inline-block";
        titleElement.style.verticalAlign=['steam','imdb','netease','apple'].includes(currentPage) ? "middle" : "top";
        if (currentPage==='steam'){
            button.classList.add('steam-title-button');
        } else if (currentPage==='imdb'){
            button.classList.add('imdb-title-button');
            const titleContainer=titleElement.parentElement;
            if (titleContainer){
                titleContainer.style.display='flex';
                titleContainer.style.alignItems='center';
                titleContainer.style.gap='12px';
                titleContainer.style.flexWrap='wrap';
            }
        } else if (currentPage==='netease'){
            button.classList.add('netease-title-button');
        } else if (currentPage==='apple'){
            button.classList.add('apple-title-button');
            button.onclick=handleCollectClick;
            titleElement.appendChild(button);
            return;
        }
        button.onclick=handleCollectClick;
        titleElement.insertAdjacentElement('afterend', button);
    };

    if (['bandcamp','apple','discogs','steam','imdb','spotify','netease'].includes(currentPage)){
        const titleElement=getTitleElement();
        if (titleElement){
            createTitleButton(titleElement);
            return;
        }

        if (attempt<20){
            setTimeout(()=>createButton(currentPage, attempt+1), 500);
        }
        return;
    }

    var button=document.createElement("button");
    button.id=collectButtonId;
    button.innerHTML ="采集";
    button.style = "top:0;left:0;position:absolute;z-index:9999";
    button.onclick=handleCollectClick;
    document.body.appendChild(button);
}

let main = ()=>{

    //console.log("chekc");
    let currentPage=getCurrentPage();

    const requestPendingData = () => {
        browser.runtime.sendMessage({page:currentPage});
    };

    // listens to background script message
    // only get message on doubanMusic1 opened by the bandcamp button
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Message from the background script:");
        if (message.data){
            let dataBackground=JSON.parse(message.data)
            let page=null;
            if(currentPage=='doubanMusic1'){
                page=new DoubanMusicPage1();
            } else if (currentPage=='doubanGame1'){
                page=new DoubanGamePage1();
            } else if (currentPage=='doubanMovie1'){
                console.log('this is movie1');
                page=new DoubanMoviePage1();
            }
            if (page){
                console.log(dataBackground);
                page.fill(dataBackground);
                localStorage.setItem(localStorageID, JSON.stringify(dataBackground));
                try{
                    page.click(dataBackground);
                } catch (err){console.log(err);}
                sendResponse({ok:true});
                return true;
            }
        }
        sendResponse({ok:false});
        return true;
    });

    // autofill douban-2 if da ta is stored to localStorage
    let dataStored=localStorage.getItem(localStorageID)
    if (dataStored){
        dataStored=JSON.parse(dataStored);
        let page;
        if (currentPage=='doubanMusic2'){
            page=new DoubanMusicPage2();
        } else if (currentPage=='doubanGame2'){
            page=new DoubanGamePage2();
        } else if (currentPage=='doubanMovie2'){
            page=new DoubanMoviePage2();
        }
        if (page){
            page.fill(dataStored);
            localStorage.removeItem(localStorageID);
        }
    }

    // Default action: add buttons to bandcamp/discogs/soundcloud/apple pages
    console.log(currentPage);
    switch(currentPage){
        case 'bandcamp':
        case 'discogs':
        case 'apple':
        // case 'soundcloud':
        case 'steam':
        case 'imdb':
        case 'spotify':
        case 'netease':
            createButton(currentPage);
            break;
        case 'doubanMusic1':
        case 'doubanMusic2':
        case 'doubanGame1':
        case 'doubanGame2':
        case 'doubanMovie1':
        case 'doubanMovie2':
            requestPendingData();
            setTimeout(requestPendingData, 800);
            setTimeout(requestPendingData, 1800);
            break;
    }
}

main();


console.log('content script ends');


// TODO
// https://www.discogs.com/Various-Sweet-House-Chicago/master/79323
// https://adaptedrecords.bandcamp.com/album/freedom
// https://music.apple.com/cn/album/%E6%90%96%E6%BB%BE86/1391495014 (date)
// get track duration on apple music
// https://www.discogs.com/Greekboy-Shaolin-Technics/release/11434711 (format)
// https://music.apple.com/us/album/the-palmwine-express/1491006159 (url)
// https://www.discogs.com/Various-Starship-The-De-Lite-Superstars/release/569725 (genre name map)
// https://www.discogs.com/Richard-Groove-Holmes-Soul-Power/release/2997598 (artist)
// [FIXED] bc track list sometimes has extra space (https://lbrecordings.bandcamp.com/album/l-b020-hyperromantic-isle-of-dead-ep)
// Master page on discogs grab label from the first release. 
// Recognize digital on discog from format like this https://www.discogs.com/DJ-Trax-Find-A-Way-EP/release/16466505 
// Recognize artist/duration on apple music like this https://music.apple.com/us/album/lo-fi-house-zip/1490994043
// Auto recognize EP in album title: https://how2make.bandcamp.com/album/vortex-ep
// Recognize label on bandcamp from side column (if label==artist then use self-released)
// Recognize "12''" on discogs https://www.discogs.com/Wax-Doctor-Cruise-Control-EP/release/90227 
// guess a release is EP/album by track count/track list numbering
// Multiple artists on bandcamp? 
// Add tags onto bandcamp description
// discogs; remove (NUM) from label/artist affixes. 
