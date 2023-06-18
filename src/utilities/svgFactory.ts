import type { IconFactory } from "@type/UtilsTypes";

export const icon: IconFactory = {
  info: (fill, size) => /* html */ `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" viewBox="0 0 74 74">
      <rect width="74" height="74" fill="none"/>
      <path d="M40.657,38.124h10.2L50.8,77.772H40.657ZM45.731,19a6.122,6.122,0,1,1-6.122,6.122A6.122,6.122,0,0,1,45.731,19Z" transform="translate(-8.786 -11.12)" fill="${fill}"/>
    </svg>`,

  next: (fill, size) => /* html */ `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" viewBox="0 0 74 74">
    <rect width="74" height="74" fill="none"/>
    <g transform="translate(-28.581 6.732)">
      <g transform="translate(48.224)">
        <g transform="translate(0)">
          <path d="M52.745,60.535l-4.521-4.57,26.546-25.7L48.224,4.568,52.745,0,82.939,30.269Z" transform="translate(-48.224)" fill="${fill}"/>
        </g>
      </g>
    </g>
    </svg>`,

  refresh: (fill, size) => /* html */ `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" viewBox="0 0 74 74">
      <rect width="74" height="74" fill="none"/>
      <path d="M55.148,13.867a29.123,29.123,0,0,0-7.136-7.619L54.23,0h-18.1V18.184l8.455-8.5a24.242,24.242,0,1,1-38.1,19.885A24.092,24.092,0,0,1,20.139,7.757L18.045,3.45a29.033,29.033,0,1,0,37.1,10.417Z" transform="translate(6.273 7.697)" fill="${fill}"/>
    </svg>`,

  add: (fill, size) => /* html */ `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" viewBox="0 0 74 74">
      <rect width="74" height="74" fill="none"/>
      <path d="M26.61,58.725h5.506V32.115h26.61V26.61H32.115V0H26.61V26.61H0v5.506H26.61Z" transform="translate(7.637 7.637)" fill="${fill}"/>
    </svg>`,

  music: (fill, size) => /* html */ `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" viewBox="0 0 74 74">
    <rect width="74" height="74" fill="none"/>
    <g transform="translate(-27.203 7.786)">
      <g transform="translate(40.483)">
        <path d="M87.682,42.807c.944,3.057-.947,6.794-4.61,8.743-4.036,2.145-8.682,1.3-10.374-1.885s.205-7.509,4.241-9.653a9.43,9.43,0,0,1,6.18-1.031L83.027,5.55,56.1,10.254l0,38.271c.927,3.053-.963,6.776-4.618,8.717-4.036,2.144-8.681,1.3-10.374-1.884s.205-7.51,4.241-9.656a9.419,9.419,0,0,1,6.188-1.029l.006-38.342L87.8,0Z" transform="translate(-40.483)" fill="${fill}"/>
      </g>
    </g>
    </svg>`,

  minus: (fill, size) => /* html */ `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" viewBox="0 0 74 74">
      <rect width="74" height="74" fill="none"/>
      <path d="M58.725,32.115V26.61H0v5.506Z" transform="translate(7.637 7.637)" fill="${fill}"/>
    </svg>`,

  gen: (fill, size) => /* html */ `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" viewBox="0 0 75 75">
    <rect width="75" height="75" fill="none"/>
    <g transform="translate(8.882 8.883)">
      <path d="M48.863,8.372a28.617,28.617,0,1,0,0,40.49A28.663,28.663,0,0,0,48.863,8.372Zm-37.6,37.6a24.54,24.54,0,1,1,34.705,0A24.568,24.568,0,0,1,11.265,45.97Z" transform="translate(0 0)" fill="${fill}"/>
      <path d="M81.408,63.711H67.8V50.1h-4.09V63.711H50.1V67.8H63.711V81.408H67.8V67.8H81.408Z" transform="translate(-37.138 -37.139)" fill="${fill}"/>
    </g>
    </svg>`,
};
