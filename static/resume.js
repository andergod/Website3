// JavaScript code for the resume

// Function to add a timeline item
function addTimelineItem(date, company, title, description) {
  var timeline = document.getElementById("timeline");

  var item = document.createElement("li");
  item.className = "timeline-item";

  var dateElem = document.createElement("p");
  dateElem.className = "timeline-date";
  dateElem.textContent = date;

  var companyElem = document.createElement("p");
  companyElem.className = "timeline-company";
  companyElem.textContent = company;

  var titleElem = document.createElement("p");
  titleElem.className = "timeline-title";
  titleElem.textContent = title;

  var descElem = document.createElement("p");
  descElem.className = "timeline-description";
  descElem.innerHTML = description;

  item.appendChild(dateElem);
  item.appendChild(companyElem);
  item.appendChild(titleElem);
  item.appendChild(descElem);

  timeline.appendChild(item);
}

// Add sample timeline items
addTimelineItem("2018 - 2020", "Company A", "Position A", "<ul><li>Responsibility 1</li><li>Responsibility 2</li><li>Responsibility 3</li></ul>");
addTimelineItem("2016 - 2018", "Company B", "Position B", "<ul><li>Responsibility 1</li><li>Responsibility 2</li><li>Responsibility 3</li></ul>");
addTimelineItem("2014 - 2016", "Company C", "Position C", "<ul><li>Responsibility 1</li><li>Responsibility 2</li><li>Responsibility 3</li></ul>");
