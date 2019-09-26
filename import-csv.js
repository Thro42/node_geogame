var admin = require('firebase-admin');

var serviceAccount = require('./serviceAccount.json');
var firestore_settings = require('./firebaseconfig.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firestore_settings.databaseURL
});
const firestore = admin.firestore();

firestore.settings(firestore_settings);

if ( process.argv.length > 2) {
	importfile = process.argv[2];
} else {
	importfile = 'csvlist.json';
}
console.log('importfile: ' + importfile);

// Read the Input File
const fs = require('fs');
let rawdata = fs.readFileSync(importfile);
let caches = JSON.parse(rawdata);
console.log('Read the Input File');
deleteOld().then( flag => {
	caches.forEach(function(obj) {
	   console.log(obj);
	   //var coordinates = { _latitude: obj.coordinates[0],_longitude: obj.coordinates[1]};
	   var cord = new admin.firestore.GeoPoint(obj.coord_lat,obj.coord_long);
	   firestore.collection('caches').add({ 
			id: obj.id,
			description: obj.description,
			header: obj.header,
			visible: obj.visible,
			code: obj.code,
			is_final: obj.is_final,
			found_by: obj.found_by,
			schow_for: obj.schow_for,
			coordinates:cord,
			found: obj.found
		});
	});
  });

async function deleteOld() {
	var isDeleting = true;
// Delete all Old Dokuments
    console.log('Delete all Old Dokuments');
	return new Promise(function(resolve, reject) {
		firestore.collection('caches').get().then(snapshot => {
			snapshot.docs.forEach(doc => {
				console.log('Delete: '+ doc.id);
				firestore.collection('caches').doc(doc.id).delete();
				//doc.delete();
			});
			resolve(isDeleting) // successfully fill promise
		});
	});
}