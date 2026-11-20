// Slides for "Året der gik 2026". Geometry is taken from Figma and expressed in
// card coordinates (the white card is 353 × 679 and sits 20px in from the screen edge).

const roleCircleBack = {
  box: [5, 207, 343, 253.848],
  frame: [307.395, 185.066],
  transform: "rotate(13.98deg)",
  inset: ["-2.12%", "-1.55%", "-2.6%", "-1.53%"],
};

const roleCircleFront = {
  box: [5.61, 221.17, 338.899, 239.674],
  frame: [306.767, 170.616],
  transform: "rotate(13.98deg)",
  inset: ["-2.69%", "-1.53%", "-2.5%", "-1.24%"],
};

export const slides = [
  {
    id: "rolle",
    page: "var(--accent-5)",
    card: "#fcfcff",
    arrow: "/year/back-light.svg",
    button: { label: "Næste", theme: "teal" },
    layers: [
      { ...roleCircleBack, src: "/year/role-circle-back.svg", draw: "drawBack" },
      {
        box: [24, 99, 315, 376.181],
        frame: [270.379, 342.149],
        transform: "rotate(7.93deg)",
        src: "/year/leather-bag.png",
        // Figma's exported crop (left -31.23%, top 11.65%) cuts the bag off; these offsets
        // reproduce the placement seen in the Figma render with the full bag visible.
        imgStyle: { height: "103.65%", left: "-12.5%", top: "0.6%", width: "108.95%" },
      },
      { ...roleCircleFront, src: "/year/role-circle-front.svg", draw: "drawFront" },
    ],
  },
  {
    id: "koeb-i-alt",
    page: "var(--accent-1)",
    card: "#fff0ea",
    arrow: "/year/back-light.svg",
    button: { label: "Se dit første køb", theme: "teal" },
    layers: [],
  },
  {
    id: "foerste-koeb",
    page: "var(--accent-1)",
    card: "#fff0ea",
    arrow: "/year/back-light.svg",
    button: { label: "Næste", theme: "teal" },
    layers: [
      {
        box: [61, 289, 222.109, 223.285],
        frame: [207.066, 205.781],
        transform: "rotate(94.72deg) scaleY(-1)",
        inset: ["-1.77%", "-0.38%", "-2.2%", "-1.15%"],
        src: "/year/first-circle-back.svg",
        draw: "drawFirstBack",
      },
      {
        box: [61, 331, 232.456, 200.609],
        frame: [196.841, 147.716],
        transform: "rotate(17.72deg)",
        src: "/year/controller.png",
        cover: true,
      },
      {
        box: [71.54, 289.71, 211.573, 199.223],
        frame: [183.636, 197.141],
        transform: "rotate(94.72deg) scaleY(-1)",
        inset: ["-2.35%", "-2.54%", "-1.96%", "-1.32%"],
        src: "/year/first-circle-front.svg",
        draw: "drawFirstFront",
      },
    ],
  },
  {
    id: "solgt-kategori",
    page: "var(--secondary)",
    card: "var(--accent-4)",
    arrow: "/year/back-dark.svg",
    button: { label: "Næste", theme: "light" },
    layers: [
      { ...roleCircleBack, src: "/year/shoe-circle-back.svg", draw: "drawBack" },
      {
        box: [-35, 111, 423.846, 445.935],
        frame: [308.43, 351.506],
        transform: "rotate(-23.74deg)",
        src: "/year/shoe.png",
        cover: true,
      },
      { ...roleCircleFront, src: "/year/shoe-circle-front.svg", draw: "drawFront" },
    ],
  },
  {
    id: "solgt-i-alt",
    page: "var(--accent-4)",
    card: "var(--secondary)",
    cardImage: "/year/total-illustration.png",
    arrow: "/year/back-dark.svg",
    button: { label: "Næste", theme: "teal" },
    layers: [],
  },
  {
    id: "slut",
    page: "var(--accent-5)",
    card: "#fcfcff",
    arrow: "/year/back-light.svg",
    button: { label: "Afslut", theme: "teal" },
    layers: [
      {
        box: [92, 183, 169, 176],
        frame: [169, 176],
        src: "/year/couple.png",
        imgStyle: { inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 },
      },
      {
        box: [31.7, 131, 289.401, 256.815],
        frame: [250.868, 284.166],
        transform: "rotate(91.21deg) scaleY(-1)",
        inset: ["-1.65%", "-1.87%", "-1.6%", "-1.72%"],
        src: "/year/heart.svg",
        draw: "drawHeart",
      },
    ],
  },
];
