// ==UserScript==
// @name           LeBonCoin Add-on
// @namespace      leboncoin
// @version        1.3.4
// @include        http://www.leboncoin.fr/*
// @include        http://www*.leboncoin.fr/*
// ==/UserScript==
var baselink = 'http://alerte-leboncoin.ilatumi.org';


// log via Firebug
if (unsafeWindow.console && unsafeWindow.console.log) {
	console.log = unsafeWindow.console.log;
}

var init = function () {
    var container = document.getElementById('tabnav');
    if (!container) {
        return;
    }
    var li;
    
    document.getElementById('tabarea').style.width = '850px';
    
    // Flux RSS
    var elLink = document.createElement('a');
    elLink.href = baselink + '/feed/rss?link=' + encodeURIComponent(document.location.href);
    elLink.target = '_blank';
    var rssImage = document.createElement('img');
    rssImage.src = baselink + '/images/rss.gif';
    rssImage.alt = 'RSS';
    elLink.appendChild(rssImage);
    li = document.createElement('li');
    li.appendChild(elLink);
    container.appendChild(li);
    
    // Alert Mail
    var elLinkAlertMail = document.createElement('a');
    elLinkAlertMail.href = baselink + '/api/compte/mes-alertes?prelink=' + encodeURIComponent(document.location.href);
    elLinkAlertMail.target = '_blank';
    var alertMailImage = document.createElement('img');
    alertMailImage.src = baselink + '/images/alert-mail.png';
    alertMailImage.alt = "Alert Mail";
    elLinkAlertMail.appendChild(alertMailImage);
    li = document.createElement('li');
    li.appendChild(elLinkAlertMail);
    container.appendChild(li);
}
init();



/**
 * Ajout d'un champ pour générer les itinéraires
 */
var addressInput;
var tabarea = document.getElementById('tabarea');
if (!tabarea) {
    tabarea = document.getElementsByClassName('ad_links');
    if (tabarea.length > 0) {
		tabarea = tabarea[0];
    }
}
if (tabarea && tabarea.parentNode) {
    var addressContainer = document.createElement('div');
    
    var addressLabel = document.createElement('label');
    addressLabel.innerHTML = 'Votre adresse : ';
    addressLabel.setAttribute('for', 'address');
    
    // champ de l'adresse
    addressInput = document.createElement('input');
    addressInput.setAttribute('type', 'text');
    addressInput.setAttribute('id', 'address');
    addressInput.setAttribute('name', 'address');
	addressInput.setAttribute('value', '');
    addressInput.setAttribute('size', 70);
    addressInput.setAttribute('title', 'Entrez ici votre adresse de départ pour votre itinéraire. La valeur sera sauvegardée automatiquement à la sortie du champ.');
    try {
    	if (localStorage.getItem('addressValue')) {
			addressInput.setAttribute('value', localStorage.getItem('addressValue'));
    	}
    } catch (e) {}
    
    // image pour effacer le champ
    var addressImgClear = document.createElement('img');
    addressImgClear.setAttribute('src', baselink+'/images/icons/32x32/clear.png');
    addressImgClear.setAttribute('alt', 'Éffacer');
    addressImgClear.setAttribute('style', 'vertical-align: middle; cursor: pointer;');
    addressImgClear.setAttribute('title', 'Effacer le champ adresse');
    
    addressContainer.appendChild(addressLabel);
    addressContainer.appendChild(addressInput);
    addressContainer.appendChild(addressImgClear);
    tabarea.parentNode.insertBefore(addressContainer, tabarea);
    
    addressInput.addEventListener('change', function (event) {
		try {
			localStorage.setItem('addressValue', this.value);
		} catch (e) {
			if (!localStorage) {
				alert('Attention : le champ ne sera pas sauvegardé car votre navigateur ne le permet pas.');
			}
		}
    }, false);
    
    addressImgClear.addEventListener('click', function (event) {
	try {
	    localStorage.removeItem('addressValue');
	} catch (e) {}
		addressInput.setAttribute('value', '');
    }, false);
}


/**
 * Cette partie rend les villes cliquable pour une localisation
 * sur Google Map
 */

var gotoGoogleMap = function(event) {
    event.preventDefault();
    if (!addressInput) {
		return;
    }
    
    if (!addressInput.value) {
		alert('Aucune adresse de départ spéciée');
		addressInput.focus();
		return;
    }
    
    window.open('http://maps.google.fr/maps?daddr=' +this.title+'&saddr='+addressInput.value);
};

var table = document.getElementById('hl');
if (table) { // placement du lien sur page de résultat
	var lines = document.querySelectorAll('table#hl>tbody>tr');
	var i, td, link, textNode, linkIti, imgIti;
	for (i = 0; i < lines.length; i++) {
		td = lines[i].cells[lines[i].cells.length-1];
		if (td.getElementsByTagName('br').length == 2) {
			textNode = td.lastChild;
			link = document.createElement('a');
			link.href = 'http://maps.google.fr/?z=9&q=' + textNode.data.trim();
			link.target = '_blank';
			link.title = 'Localiser sur Google Map';
			td.replaceChild(link, textNode);
			link.appendChild(textNode);
					
			linkIti = document.createElement('a');
			linkIti.href = '#';
			linkIti.title = textNode.data.trim();
			imgIti = document.createElement('img');
			imgIti.setAttribute('src', baselink+'/images/icons/28x28/map.png');
			imgIti.setAttribute('alt', 'Itinéraire');
			imgIti.setAttribute('style', 'margin-left: 5px; vertical-align: middle;');
			td.appendChild(linkIti);
			linkIti.appendChild(imgIti);
			
			linkIti.addEventListener('click', gotoGoogleMap, false);
		}
	}
} else { // on va voir si on est sur une page d'une annonce
	var divAd = document.getElementsByClassName('lbcAdParams');
	if (divAd.length) { // yeaaaah
		var j, labels = divAd[0].getElementsByTagName('label'),
		    strongs, link, linkIti, imgIti;
		for (j = 0; j < labels.length; j++) {
			if (labels[j].innerHTML.match(/Ville|Code postal/)) {
				strongs = labels[j].parentNode.getElementsByTagName('strong');
				if (strongs.length > 0) {
					link = document.createElement('a');
					link.href = 'http://maps.google.fr/?z=9&q=' + strongs[0].innerHTML.trim();
					link.target = '_blank';
					link.title = 'Localiser sur Google Map';
					link.appendChild(strongs[0]);
					labels[j].parentNode.appendChild(link);
					
					linkIti = document.createElement('a');
					linkIti.href = '#';
					linkIti.title = strongs[0].innerHTML.trim();
					imgIti = document.createElement('img');
					imgIti.setAttribute('src', baselink+'/images/icons/20x20/map.png');
					imgIti.setAttribute('alt', 'Itinéraire');
					imgIti.setAttribute('style', 'margin-left: 5px; vertical-align: middle;');
					labels[j].parentNode.appendChild(linkIti);
					linkIti.appendChild(imgIti);
					
					linkIti.addEventListener('click', gotoGoogleMap, false);
				}
			}
		}
	}
}



/**
 * Sauvegarde des informations entrées dans les champs
 * de création d'annonce
 */
var activeStorage = true;
try {
	items = localStorage.getItem('form-datas');
} catch (e) {
	activeStorage = false;
}

var validateInput = document.querySelectorAll('input[name=validate]');
if (activeStorage && validateInput.length > 0) {
	items = JSON.parse(items);
	if (!items) {
		items = {};
	}
	
	var zipcode = document.querySelectorAll('input[name=zipcode]')[0];
	
	// restore les valeurs
	if (items.region && document.getElementById('region')) {
		document.getElementById('region').value = items.region;
		unsafeWindow.showDepartment('region');
	}
	if (items.dpt_code && document.getElementById('dpt_code')) {
		document.getElementById('dpt_code').value = items.dpt_code;
	}
	if (items.zipcode && zipcode) {
		zipcode.value = items.zipcode;
	}
	if (items.category && document.getElementById('category')) {
		document.getElementById('category').value = items.category;
		unsafeWindow.showCategory('category', 'carextras', 'company_ad', 'err_category');
		unsafeWindow.toggleCompteproFields();
	}
	if (items.private_ad_id && document.getElementById('private_ad_id')) {
		document.getElementById('private_ad_id').checked = items.private_ad_id;
	}
	if (items.company_ad_id && document.getElementById('company_ad_id')) {
		document.getElementById('company_ad_id').checked = items.company_ad_id;
		if (items.company_ad_id) {
			unsafeWindow.showType('company_ad_id', 'lname');
			unsafeWindow.checkEmail();
			unsafeWindow.toggleCompteproFields();
		}
	}
	if (document.getElementById('rs')) {
		document.getElementById('rs').checked = items.rs;
		if (items.rs) {
			unsafeWindow.typeChanged('s', 'dprice', 'lprice', 'category', 'company_ad');
		}
	}
	if (document.getElementById('rk')) {
		document.getElementById('rk').checked = items.rk;
		if (items.rk) {
			unsafeWindow.typeChanged('k', 'dprice', 'lprice', 'category', 'company_ad');
		}
	}
	if (items.name && document.getElementById('name')) {
		document.getElementById('name').value = items.name;
	}
	if (items.phone && document.getElementById('phone')) {
		document.getElementById('phone').value = items.phone;
	}
	if (items.phone_hidden && document.getElementById('phone_hidden')) {
		document.getElementById('phone_hidden').checked = items.phone_hidden;
	}
	if (items.body && document.getElementById('body')) {
		document.getElementById('body').value = items.body;
	}
	if (items.subject && document.getElementById('subject')) {
		document.getElementById('subject').value = items.subject;
	}
	if (items.price && document.getElementById('price')) {
		document.getElementById('price').value = items.price;
	}
	
	//spécial immobilier
	if (items.dreal_estate_type && document.getElementById('dreal_estate_type')) {
		document.getElementById('dreal_estate_type').value = items.dreal_estate_type;
	}
	if (items.energy_rate && document.getElementById('energy_rate')) {
		document.getElementById('energy_rate').value = items.energy_rate;
	}
	if (items.ges && document.getElementById('ges')) {
		document.getElementById('ges').value = items.ges;
	}
	var square = document.querySelectorAll('input[name=square]');
	if (items.square && square.length) {
		square[0].value = items.square;
	}
	var rooms = document.querySelectorAll('input[name=rooms]');
	if (items.rooms && rooms.length) {
		rooms[0].value = items.rooms;
	}
	var capacity = document.querySelectorAll('input[name=capacity]');
	if (items.capacity && capacity.length) {
		capacity[0].value = items.capacity;
	}
	
	// spécial véhicule
	if (items.regdate && document.getElementById('regdate')) {
		document.getElementById('regdate').value = items.regdate;
	}
	if (items.fuel && document.getElementById('fuel')) {
		document.getElementById('fuel').value = items.fuel;
	}
	if (items.mileage && document.getElementById('mileage')) {
		document.getElementById('mileage').value = items.mileage;
	}
	if (items.gearbox && document.getElementById('gearbox')) {
		document.getElementById('gearbox').value = items.gearbox;
	}
	if (items.cubic_capacity && document.getElementById('cubic_capacity')) {
		document.getElementById('cubic_capacity').value = items.cubic_capacity;
	}
	
	// spécial vêtement
	if (items.clothing_type && document.getElementById('clothing_type')) {
		document.getElementById('clothing_type').value = items.clothing_type;
	}
	
	// spécial animaux
	if (items.tattooed_animal && document.getElementById('tattooed_animal')) {
		document.getElementById('tattooed_animal').value = items.tattooed_animal;
	}
	if (items.vaccinated_animal && document.getElementById('vaccinated_animal')) {
		document.getElementById('vaccinated_animal').value = items.vaccinated_animal;
	}
	if (items.animal_chips && document.getElementById('animal_chips')) {
		document.getElementById('animal_chips').value = items.animal_chips;
	}
	
	// spécial service
	if (items.siren && document.getElementById('siren')) {
		document.getElementById('siren').value = items.siren;
	}
	
	
	/**
	 * Sauvegarde des données dans le storage
	 */
	var saveDatas = function (event) {
		items = {};
		if (document.getElementById('region')) {
			items.region = document.getElementById('region').value;
		}
		if (document.getElementById('dpt_code')) {
			items.dpt_code = document.getElementById('dpt_code').value;
		}
		if (zipcode) {
			items.zipcode = zipcode.value;
		}
		if (document.getElementById('category')) {
			items.category = document.getElementById('category').value;
		}
		if (document.getElementById('private_ad_id')) {
			items.private_ad_id = document.getElementById('private_ad_id').checked;
		}
		if (document.getElementById('company_ad_id')) {
			items.company_ad_id = document.getElementById('company_ad_id').checked;
		}
		if (document.getElementById('rs')) {
			items.rs = document.getElementById('rs').checked;
		}
		if (document.getElementById('rk')) {
			items.rk = document.getElementById('rk').checked;
		}
		if (document.getElementById('name')) {
			items.name = document.getElementById('name').value;
		}
		if (document.getElementById('phone')) {
			items.phone = document.getElementById('phone').value;
		}
		if (document.getElementById('phone_hidden')) {
			items.phone_hidden = document.getElementById('phone_hidden').checked;
		}
		if (document.getElementById('body')) {
			items.body = document.getElementById('body').value;
		}
		if (document.getElementById('subject')) {
			items.subject = document.getElementById('subject').value;
		}
		if (document.getElementById('price')) {
			items.price = document.getElementById('price').value;
		}
		
		// spécial immobilier
		if (document.getElementById('dreal_estate_type')) {
			items.dreal_estate_type = document.getElementById('dreal_estate_type').value;
		}
		if (document.getElementById('energy_rate')) {
			items.energy_rate = document.getElementById('energy_rate').value;
		}
		if (document.getElementById('ges')) {
			items.ges = document.getElementById('ges').value;
		}
		var square = document.querySelectorAll('input[name=square]');
		if (square.length) {
			items.square = square[0].value;
		}
		var rooms = document.querySelectorAll('input[name=rooms]');
		if (rooms.length) {
			items.rooms = rooms[0].value;
		}
		var capacity = document.querySelectorAll('input[name=capacity]');
		if (capacity.length) {
			items.capacity = capacity[0].value;
		}
		
		// spécial voiture
		if (document.getElementById('regdate')) {
			items.regdate = document.getElementById('regdate').value;
		}
		if (document.getElementById('fuel')) {
			items.fuel = document.getElementById('fuel').value;
		}
		if (document.getElementById('mileage')) {
			items.mileage = document.getElementById('mileage').value;
		}
		if (document.getElementById('gearbox')) {
			items.gearbox = document.getElementById('gearbox').value;
		}
		if (document.getElementById('cubic_capacity')) {
			items.cubic_capacity = document.getElementById('cubic_capacity').value;
		}
		
		// spécial vêtement
		if (document.getElementById('clothing_type')) {
			items.clothing_type = document.getElementById('clothing_type').value;
		}
		
		// spécial animaux
		if (document.getElementById('tattooed_animal')) {
			items.tattooed_animal = document.getElementById('tattooed_animal').value;
		}
		if (document.getElementById('vaccinated_animal')) {
			items.vaccinated_animal = document.getElementById('vaccinated_animal').value;
		}
		if (document.getElementById('animal_chips')) {
			items.animal_chips = document.getElementById('animal_chips').value;
		}
		
		// spécial service
		if (document.getElementById('siren')) {
			items.siren = document.getElementById('siren').value;
		}
		
		
		localStorage.setItem('form-datas', JSON.stringify(items));
	};
	
	/**
	 * Efface la sauvegarde
	 */
	var resetDatas = function (event) {
		localStorage.removeItem('form-datas');
		alert('Données effacées du cache');
	};
	
	
	// bouton "sauvegarder"
	validateInput = validateInput[0];
	
	var buttonSave = document.createElement('input');
	buttonSave.setAttribute('type', 'button');
	buttonSave.setAttribute('value', 'Sauvegarder (*)');
	buttonSave.setAttribute('style', 'margin-left: 50px;');
	validateInput.parentNode.appendChild(buttonSave);
	buttonSave.addEventListener('click', saveDatas, false);
	
	var buttonReset = document.createElement('input');
	buttonReset.setAttribute('type', 'button');
	buttonReset.setAttribute('value', 'Effacer la sauvegarde');
	validateInput.parentNode.appendChild(buttonReset);
	buttonReset.addEventListener('click', resetDatas, false);
	
	var helpBackup = document.createElement('p');
	helpBackup.innerHTML = '* sauvegarde dans le navigateur les données du formulaire. Ces données seront restaurées au prochain chargement de la page, même après redémarrage du navigateur.<br />' +
		'<strong>si vous êtes sur un ordinateur public, n\'utilisez pas cette fonction.</strong>';
	validateInput.parentNode.appendChild(helpBackup);
}

