const fullFileNameArray = [];
let fileLocation;

function getNames(fileArray) {
  const nameArray = _.map(fileArray, (file) => {
    const fileNameWithExtension = file.name;
    fullFileNameArray.push(fileNameWithExtension);
    const nameWithoutExtension = removeExtension(fileNameWithExtension);
    const justName = removeJPEGNumber(nameWithoutExtension);
    return justName;
  });
  return nameArray;
}

function removeExtension(fileName) {
  const nameWithoutExtension = fileName.replace(/\..*/, '');
  return nameWithoutExtension;
}

function removeJPEGNumber(fileName) {
  const justName = fileName.replace(/\-.+/, ''); // Remove anything after the first dash encaountered
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

$(document).ready(() => {
  let uniqueNameArray = [];
  let countArray;
  let nameArray;
  const formContent = $('.form');
  const formHTML = `
    <div>
      <form>
        <input id="readFiles" class="inputFile" type="file" data-multiple-caption="{count} files selected" multiple value="Select files" />
        <label class="btn waves-effect" for="readFiles">Choose photos</label>
        <input id="count" type="number" min="1" placeholder="How many images of each child?" />
        <input id="school" type="text" placeholder="School name" />
        <div id="dateSection"></div>
        <label>
          <input id="imageData" type="checkbox" />
          <span>Check here if you'd like an image data file.</span>
        </label>
      </form>
    </div>
    <button class="btn-large waves-effect" id="submit">Create List!</button>
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
  $('.form').on('change', '#readFiles', (event) => {
    let fileName = '';
    const readFiles = $('#readFiles')[0];
    const numberOfFiles = readFiles.files && readFiles.files.length;
    if (numberOfFiles > 1) {
      fileName = (readFiles.getAttribute('data-multiple-caption') || '').replace('{count}', numberOfFiles);
    } else if (numberOfFiles) {
      fileName = readFiles.files[0].name;
    }

    if (fileName) {
      $('#readFiles').next('label').html(fileName);
    }
  });
  $('.form').on('click', '#imageData', () => {
    console.log('Radio clicked!');
    const dateHTML = $('#imageData:checked').val() ? '<label for="date">Date shot</label><input id="date" type="date" placeholder="Date shot" />' : '';
    $('#dateSection').html(dateHTML);
  });
  $('.form').on('click', '#submit', () => {
    const files = $('#readFiles')[0].files;
    const count = $('#count').val();
    const school = $('#school').val();
    const date = $('#date').val();
    const includeImageData = $('#imageData:checked').val();
    
    if (_.isEmpty(files)) {
      alert('Please select files');
    } else if (!count || !school || (includeImageData && !date)) {
      alert('All fields are required');
    } else {
      nameArray = getNames(files);
      uniqueNameArray = _.uniq(nameArray);
      countArray = getCount(nameArray, uniqueNameArray);
      const filesWithMultiples = addMultiples(count, uniqueNameArray, countArray);
      const commaSeparatedClassArray = separateClassWithComma(filesWithMultiples);
      const spreadsheetContent = createSpreadsheet(commaSeparatedClassArray);
      const plural = includeImageData ? 's' : '';

      const fileNames = includeImageData ? `"${school}.csv" and "${school}.txt"` : `"${school}.csv"`;
      function download() {
        var downloadCSV = document.createElement('a');
        downloadCSV.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(spreadsheetContent)}`);
        downloadCSV.setAttribute('download', `${school}.csv`);
        downloadCSV.click();
        if (includeImageData) {
          const groupArray = createGroupArray(countArray);
          const imageDataContent = createImageData(nameArray, groupArray, date, school);
          var downloadTXT = document.createElement('a');
          downloadTXT.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(imageDataContent)}`);
          downloadTXT.setAttribute('download', `${school}.txt`);
          downloadTXT.click();
        }
        alert(`File${plural} successfully created!\nCheck for file${plural} named ${fileNames} in your "Downloads" folder.`);
      }
      setTimeout(() => {
        download();
      }, 500);
    }
  });
});