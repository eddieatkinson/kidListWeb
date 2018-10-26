// const { dialog } = electron.remote; // Load remote compnent that contains the dialog dependency
// const lodash = require(['node_modules/lodash/']);
// const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

const fullFileNameArray = [];
let fileLocation;
const slash = navigator.platform == 'Win32' ? '\\' : '/';

function getNames(fileArray) {
  const nameArray = _.map(fileArray, (file) => {
    // console.log(file.name);
    const fileNameWithExtension = file.name;
    fullFileNameArray.push(fileNameWithExtension);
    const nameWithoutExtension = removeExtension(fileNameWithExtension);
    const justName = removeJPEGNumber(nameWithoutExtension);
    return justName;
  });
  return nameArray;
}

// function getNameWithExtension(wholeFileName) {
//   const wholeFileNameArray = wholeFileName.split(slash);
//   const fileNameWithExtension = wholeFileNameArray.pop();
  
//   fileLocation = wholeFileNameArray.join(slash);
  
//   return fileNameWithExtension;
// }

function removeExtension(fileName) {
  const nameWithoutExtension = fileName.replace(/\..*/, '');
  // console.log(nameWithoutExtension);
  return nameWithoutExtension;
}

function removeJPEGNumber(fileName) {
  const justName = fileName.replace(/\-.+/, ''); // Remove anything after the first dash encaountered
  // console.log(justName);
  return justName;
}

function getCount(nameArray, uniqueNameArray) {
  let i = 0;
  let count = 0;
  const lastNameIndex = nameArray.length - 1;
  const lastUniqueNameIndex = uniqueNameArray.length - 1;
  const countArray = [];
  _.forEach(nameArray, (name, index) => {
    if (name === uniqueNameArray[i]) {
      count++;
      if (lastNameIndex === index && lastUniqueNameIndex === i) {
        countArray.push(count);
      }
    } else {
      countArray.push(count);
      i++;
      count = 1;
    }
  });
  return countArray;
}

function addMultiples(count, uniqueNameArray, countArray) {
  const filesWithMultiples = [];
  _.forEach(countArray, (currentCount, index) => {
    const numberOfProofs = Math.ceil(currentCount / count);
    for (let i = 0; i < numberOfProofs; i++) {
      filesWithMultiples.push(uniqueNameArray[index]);
    }
  });
  return filesWithMultiples;
}

function separateClassWithComma(filesWithMultiples) {
  const commaSeparatedClassArray = _.map(filesWithMultiples, (file) => {
    const fileWithComma = file.replace(' ', ',');
    return fileWithComma;
  });
  return commaSeparatedClassArray;
}

function createSpreadsheet(commaSeparatedClassArray) {
  const spreadsheetContent = commaSeparatedClassArray.join('\r\n');
  return spreadsheetContent;
}

function createGroupArray(countArray) {
  let groupNumber = 1;
  const groupArray = [];
  _.forEach(countArray, (count) => {
    for (let i = 0; i < count; i++) {
      groupArray.push(groupNumber);
    }
    groupNumber++;
  });
  return groupArray;
}

function createImageData(nameArray, groupArray, date, school) {
  let imageDataContent = `Filename,FirstName,LastName,FullName,GroupTest,Class,Packages,ShootDate,SchoolName\r\n`;
  _.forEach(fullFileNameArray, (name, index) => {
    const nameInformation = separateNameAndClass(nameArray[index]);
    const className = nameInformation[0];
    const nameOnly = nameInformation[1];
    const group = groupArray[index];
    imageDataContent += `${name},${nameOnly},,${nameOnly},${group},${className},,${date},${school}\r\n`;
  });
  return imageDataContent;
}

function setNoShowRequirements() {
  localStorage.setItem('doNotShow', true);
}

function checkForNoShowRequirements() {
  const doNotShow = localStorage.doNotShow;
  return doNotShow;
}

function separateNameAndClass(fileName) {
  const fileNameArray = fileName.split(' ');
  const className = fileNameArray.shift();
  const nameOnly = fileNameArray.join(' ');
  return [className, nameOnly];
}

// function getFolderName(fileLocation) {
//   const fileLocationArray = fileLocation.split(slash);
//   const folderName = fileLocationArray.pop();
//   return folderName;
// }

$(document).ready(() => {
  let uniqueNameArray = [];
  let countArray;
  let nameArray;
  // let spreadsheetContent;
  // let school;
  // let count;
  // let date;
  // let includeImageData = false;
  const formContent = $('.form');
  const formHTML = `
    <div>
      <form>
        <!-- <input id="file" type="file" multiple /> -->
        <input class="btn-small" id="readFiles" type="file" multiple value="Select files" />
        <input id="count" type="number" min="1" placeholder="How many images of each child?" />
        <input id="school" type="text" placeholder="School name" />
        <label for="date">Date shot</label>
        <input id="date" type="date" placeholder="Date shot" />
        <label>
          <input id="imageData" type="checkbox" />
          <span>Check here if you'd like an image data file.</span>
        </label>
      </form>
    </div>
    <button class="btn-large" id="submit">Create List!</button>
    <div id="download"></div>
  `;
  const noShowRequirements = checkForNoShowRequirements();
  if (noShowRequirements) {
    formContent.html(formHTML);
  }
  $('#acceptGuidelines').click(() => {
    const doNotShow = $('#doNotShow:checked').val();
    if (doNotShow) {
      setNoShowRequirements();
    }
    formContent.html(formHTML);
  });
  // $('.form').on('click', '#readFiles', () => {
  //   // dialog.showOpenDialog({ properties: [
  //   //     'openFile', 'multiSelections',
  //   //   ]}, (fileNames) => {
  //   //       nameArray = getNames(fileNames);
  //   //       uniqueNameArray = uniq(nameArray);
  //   //       countArray = getCount(nameArray, uniqueNameArray);
  //   //     });
  // });
  $('.form').on('click', '#submit', () => {
    const files = $('#readFiles')[0].files;
    // console.log(files);
    const count = $('#count').val();
    const school = $('#school').val();
    const date = $('#date').val();
    
    if (_.isEmpty(files)) {
      alert('Please select files');
    } else if (!count || !school || !date) {
      alert('All fields are required');
    } else {
      nameArray = getNames(files);
      // console.log(nameArray);
      uniqueNameArray = _.uniq(nameArray);
      // console.log(uniqueNameArray);
      countArray = getCount(nameArray, uniqueNameArray);
      // console.log(count, countArray);
      const filesWithMultiples = addMultiples(count, uniqueNameArray, countArray);
      const commaSeparatedClassArray = separateClassWithComma(filesWithMultiples);
      // console.log(commaSeparatedClassArray);
      // const filePath = `${fileLocation}${slash}${school}`;
      const spreadsheetContent = createSpreadsheet(commaSeparatedClassArray);
      // console.log(spreadsheetContent);
      // const folderName = getFolderName(fileLocation);
      const includeImageData = $('#imageData:checked').val();
      // const fileWordPlural = includeImageData ? 's' : '';
      // const downloadButton = `<button class="btn-large" id="downloadBtn">Download file${fileWordPlural}</button>`;
      // $('#download').append(downloadButton);
      const plural = includeImageData ? 's' : '';

      const fileNames = includeImageData ? `"${school}.csv" and "${school}.txt"` : `"${school}.csv"`;
      // const includeImageData = $('#imageData:checked').val();
      function download() {
        var downloadCSV = document.createElement('a');
        downloadCSV.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(spreadsheetContent)}`);
        downloadCSV.setAttribute('download', `${school}.csv`);
        downloadCSV.click();
        // console.log(includeImageData);
        if (includeImageData) {
          const groupArray = createGroupArray(countArray);
          // console.log('Include it!');
          const imageDataContent = createImageData(nameArray, groupArray, date, school);
          var downloadTXT = document.createElement('a');
          downloadTXT.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(imageDataContent)}`);
          downloadTXT.setAttribute('download', `${school}.txt`);
          downloadTXT.click();
        }
      }
      setTimeout(() => {
        download();
      }, 500);
    // console.log('downloading!');
      // fs.writeFile(`${filePath}.csv`, spreadsheetContent, (error) => {
      //   if(error) {
      //     alert(`An error occured: ${error.message}`);
      //   } else {
      //     alert(`File successfully created!\nCheck for file${plural} named ${fileNames} in folder "${folderName}".`);
      //   }
      // });

      // if (includeImageData) {
      //   console.log('this line!');
      //   const groupArray = createGroupArray(countArray);
      //   const imageDataContent = createImageData(nameArray, groupArray, date, school);
      //   // fs.writeFile(`${filePath}.txt`, imageDataContent, (error) => {
      //   //   if (error) {
      //   //     alert(`An error occured when creating image data file: ${error.message}`);
      //   //   }
      //   // })
      // }
    }
  });
  // $('.form').on('click', '#downloadBtn', () => {
  //   const includeImageData = $('#imageData:checked').val();
  //   function download() {
  //     var downloadCSV = document.createElement('a');
  //     downloadCSV.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(spreadsheetContent)}`);
  //     downloadCSV.setAttribute('download', `${school}.csv`);
  //     downloadCSV.click();
  //     console.log(includeImageData);
  //     if (includeImageData) {
  //       const groupArray = createGroupArray(countArray);
  //       console.log('Include it!');
  //       var downloadTXT = document.createElement('a');
  //       downloadTXT.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(spreadsheetContent)}`);
  //       downloadTXT.setAttribute('download', `${school}.txt`);
  //       downloadTXT.click();
  //     }
  //   }
  //   setTimeout(() => {
  //     download();
  //   }, 500);
  //   console.log('downloading!');
  // });
});