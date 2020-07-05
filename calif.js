//instrucciones
/*
npm install pdfreader
npm i --save csvtojson

Como primer parámetro pasar el nombre del grupo, que debe ser el mismo en el CSV
y en el folder que contiene los PDFs de los alumnos dentro de /pdf

node calif.js VI_AGRO_A

Como segundo parámetro (opcional) se puede pasar el nombre del alumno entre 
comillas simples, esto hará que se analice solo un usuario y es mucho más rápido:

node calif.js VI_AGRO_A 'GARCIA CONTRERAS PAOLA'

*/


// CHANGE THIS:
const allSemesters = ['343101-13FB','322201-13FB','342201-13FB','344101-13FB','322501-13FB','322301-13FB','343102-13FB','322202-13FB','342202-13FB','322302-13FB','361100003-13M1','343103-13FB','322203-13FB','341101-13FB','322502-13FB','361100003-13M2','343104-13FB','322204-13FB','342101-13FB','341201-13FB','361100003-13M3','343105-13FPp','322205-13FPp','342102-13FB','322503-13FB','361100003-13M4'];
const assumedRowStart = 'CBTA 061';
const gradeOffset = 10;
const passingGrade = 6;

// DO NOT CHANGE THIS!!! (or anything below this line)
// catch params
var args = process.argv.slice(2);
//args[0]
let pdfreader = require("pdfreader");
let csv = require("csvtojson");
let fs = require('fs');
let count = 0;
let currentStudent = '';
let allGradesCsv = [];
const csvName = args[0]+'.csv';
const pdfFolder = './pdfs/'+args[0]+'/';
const csvFolder = './csvs/';

function removeSuffix(courseName) {
	//let's get rid of the suffix for convenience
	const courseNameMexSplit = courseName.split('-');
	let suffix = '';
	let courseNameMex = '';
	if (courseNameMexSplit[1].length === 5) {
		courseNameMex = courseNameMexSplit[0]+'-'+courseNameMexSplit[1].slice(0, -3);
		suffix = courseNameMexSplit[1].substr(courseNameMexSplit[1].length - 3);
	} else if (courseNameMexSplit[1].length === 4) {
		courseNameMex = courseNameMexSplit[0]+'-'+courseNameMexSplit[1].slice(0, -2);
		suffix = courseNameMexSplit[1].substr(courseNameMexSplit[1].length - 2);
	}
	const suff = {
		name: courseNameMex,
		suffix
	}
	return suff;
	// return courseNameMex;
}

function cotija(student, courseGrades) { //si, como el queso :P
	// console.log('-- >>Cotejando..');
	allGradesCsv.forEach(element => {

		//find the user
		if (element[1] === student) {

			console.log('\x1b[36m%s\x1b[0m', student);
			
			//loop all courses
			for (let i = 0; i < allSemesters.length; i++) {
				
				// did we find a number in this loop?
				let courseApproved = false;
				let courseName = '';
				
				//loop all grades in order to find matches
				for (courseGrade of courseGrades) {

					// console.log(70, courseGrade.courseFull);

					// TODO: por el momento estamos ignorando el sufijo alfanumérico
					// const allSplit = allSemesters[i].split('-');
					let semesterMex13 = allSemesters[i];
					let semesterMex17 = allSemesters[i].replace('13', 17);
					//let semesterPDF = removeSuffix(courseGrade.courseFull);
					let semesterPDF13 = courseGrade.courseFull;
					let semesterPDF17 = courseGrade.courseFull.replace('13', 17);

					// we need to keep only the first two characters from the suffix
					let semesterMex13f = removeSuffix(semesterMex13);
					let semesterMex17f = removeSuffix(semesterMex17);
					let semesterPDF13f = removeSuffix(semesterPDF13);
					let semesterPDF17f = removeSuffix(semesterPDF17);

					// Careful here, the code coming from MEX is always 13
					// the one from the PDFs has either 13 or 17 in the suffix

					// console.log(87, courseGrade.courseFull, semesterMex17);
					
					if (semesterPDF13f.name === semesterMex13f.name || semesterPDF17f.name === semesterMex17f.name){
						//console.log(70, 'SUFF:'+semesterPDF13f.suffix, 'FULL:'+courseGrade.courseFull, semesterPDF13f.name+'|'+semesterMex13f.name, semesterPDF17f.name+'|'+semesterMex17f.name, courseGrade.grade+'|'+element[gradeOffset + i]);
						
						if ( courseGrade.grade !== element[gradeOffset + i] ) {
							//TEST
							if (courseGrade.grade === 'NA' || courseGrade.grade === 'NP') {
								if (courseGrade.grade === 'NA') {
									courseApproved = false;
									courseName = courseGrade.courseFull;
									continue;
								}
								if (courseGrade.grade === 'NP') {
									console.log('>NP '+courseGrade.courseFull);
								}
							} else {

								//ARREGLAR ESTO!
								// there must be an exception if the prefix is the same but the suffix differs
								// meaning, 13M2 != 13M1, this is for the core subjects, as opposed to the normal
								// subjects like 17DB == 13FB
								// CAREFUL HERE!!! the number might be the same and the letter differ
								
								const courseFullSplit =  courseGrade.courseFull.split('-');
								const courseFullAlpha = courseFullSplit[1].substring(2);
								const allSemestersSplit = allSemesters[i].split('-');
								const allSemestersAlpha = allSemestersSplit[1].substring(2);
								
								//console.log(122, courseFullAlpha, allSemestersAlpha);
								

								// DO NOT TOUCH THIS UNLESS YOU KNOW WHAT YOU ARE DOING!
								// both parts MUST contain either a 13 or a 17
								if (
									
									((courseFullSplit[1].includes('13') && allSemestersSplit[1].includes('13'))
									&&
									courseFullAlpha != allSemestersAlpha)
									||
									((courseFullSplit[1].includes('17') && allSemestersSplit[1].includes('17'))
									&&
									courseFullAlpha != allSemestersAlpha)
									
									){
									continue;
								}

								courseApproved = true;
								// console.log(128, courseGrade.courseFull+'|'+allSemesters[i]);
								console.log('>DIFF '+courseGrade.courseFull+': ', 'LOCAL:'+courseGrade.grade, 'MEX:'+element[gradeOffset + i]);
								
							}
						}
						// son iguales?
						else if ( courseGrade.grade === element[gradeOffset + i] ) {
							courseApproved = true;
							// console.log('>OK '+courseGrade.course+': ', 'LOCAL:'+courseGrade.grade, 'MEX:'+element[gradeOffset + i]);
						}
					}
				}

				//approved?
				if (!courseApproved && courseName.length > 0) {
					console.log('>> ', courseName, '---- SIN CALIFICACIÓN ----');
					// coursesnotApproved.push
				}

			}
		}
	});
}

/*---------------------------------------CSV PROCESSING BEGINS-----------------------------------*/
async function processCVS() {
	console.log('-- >>Leyendo CSV...');
	// Convert a csv file with csvtojson
	csv({
		noheader:true,
		output: "csv"
	})
	.fromFile(csvFolder+csvName)
	.then((csvRow)=>{
		allGradesCsv = csvRow
		readFiles(pdfFolder);
		// cotija();
		// console.log(30, csvRow) // => [["1","2","3"], ["4","5","6"], ["7","8","9"]]
	})
}
/*------------------------------------CSV PROCESSING ENDS, BADLY---------------------------------*/



/*---------------------------------------PDF PROCESSING BEGINS-----------------------------------*/

//extract grades from file
function getGrades(rows, currentStudent) {
	let grades = []
	for (const row in rows) {
		if (rows.hasOwnProperty(row)) {
			const element = rows[row];
			// console.log(14, element);
			if (element[0].includes(assumedRowStart)) {

				//we need to make sure to account for the 13-17 difference in the course's name
				const courseNameSplit = element[2].split('-');
				// console.log(155,  element[2]);

				grades.push(
					{
						course: courseNameSplit[0],
						courseFull: element[2],
						grade: element[5],
						semester: element[3]
					}
				)
			}
		}
	}
	// console.log(154, grades);
	// once finished, save
	cotija(currentStudent, grades);
}

// extract rows from a file
async function extract(filename) {
	let rows = {}; // indexed by y-position
	// console.log('>> ', filename);
	// let table = new pdfreader.TableParser();
	new pdfreader.PdfReader().parseFileItems(pdfFolder+filename, async function(err, item) {
		if (!item || item.page) {
			if(Object.keys(rows).length === 0 && rows.constructor === Object) {
				// console.log('EMPTY');
			} else {
				// console.log(25, rows);
				filename = filename.trim();
				currentStudent = filename.substring(0, filename.length-4);
				await getGrades(rows, currentStudent);
				return true;
			}
			
			rows = {}; // clear rows for next page
		} else if (item.text) {
			(rows[item.y] = rows[item.y] || []).push(item.text);
		}
	});
}

function callback () {
	console.log('-- >>Procesado de PDFs completo');
	// processCVS();
}
function readFiles(dirname) {
	fs.readdir(dirname, (err, files) => {
	  files.sort().forEach(async file => {
			
			if (args[1]) {
				if (file !== args[1]+'.pdf') {
					return;
				}
			}

			extract(file);
			count ++;
			if(count === files.length) {
				callback();
			}
			
		});
	});
}
/*---------------------------------------PDF PROCESSING ENDS-----------------------------------*/



//const
//first we read the csv
processCVS();
// readFiles(pdfFolder);
/*
░░░░░░░░▄▄█▀▀▄░░░░░░░ 
░░░░░░▄█████▄▄█▄░░░░░ 
░░░░░▄▀██████▄▄██░░░░ 
░░░░░█░█▀░░▄▄▀█░█░░░░ 
░░░░░▄██░░░▀▀░▀░█░░░░ 
░░▄█▀░░▀█░▀▀▀▀▄▀▀█▄░░ 
░▄███░▄░░▀▀▀▀▀▄░███▄░ 
░██████░░░░░░░██████░ 
░▀███▀█████████▀███▀░ 
░░░░▄█▄░▀▀█▀░░░█▄░░░░ 
░▄▄█████▄▀░▀▄█████▄▄░ 
█████████░░░█████████
*/