export const themes = [
  {
    name: 'Chunky',
    description: 'For simple, bold diagrams.',
    graph: {
      "nodes": [
        {
          "id": "n0",
          "position": {
            "x": -52,
            "y": 0
          },
          "caption": "a",
          "style": {},
          "labels": [],
          "properties": {}
        },
        {
          "id": "n1",
          "position": {
            "x": 309.5734899055742,
            "y": 0
          },
          "caption": "b",
          "style": {},
          "labels": [],
          "properties": {}
        }
      ],
      "relationships": [
        {
          "id": "n0",
          "type": "KNOWS",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n1"
        }
      ],
      "style": {
        "node-color": "#ffffff",
        "border-width": 4,
        "border-color": "#000000",
        "radius": 50,
        "node-padding": 5,
        "outside-position": "auto",
        "caption-position": "inside",
        "caption-max-width": 200,
        "caption-color": "#000000",
        "caption-font-size": 50,
        "caption-font-weight": "normal",
        "label-position": "inside",
        "label-color": "#000000",
        "label-background-color": "#ffffff",
        "label-border-color": "#000000",
        "label-border-width": 4,
        "label-font-size": 40,
        "label-padding": 5,
        "label-margin": 4,
        "detail-position": "inline",
        "detail-orientation": "parallel",
        "arrow-width": 5,
        "arrow-color": "#000000",
        "margin-start": 5,
        "margin-end": 5,
        "margin-peer": 20,
        "attachment-start": "normal",
        "attachment-end": "normal",
        "type-color": "#000000",
        "type-background-color": "#ffffff",
        "type-border-color": "#000000",
        "type-border-width": 0,
        "type-font-size": 40,
        "type-padding": 5,
        "property-position": "outside",
        "property-color": "#000000",
        "property-font-size": 40,
        "property-font-weight": "normal"
      }
    }
  },
  {
    name: 'Bloom',
    description: 'Theme based on Neo4j Bloom.',
    graph: {
      "style": {
        "node-color": "#4C8EDA",
        "border-width": 0,
        "border-color": "#000000",
        "radius": 75,
        "node-padding": 5,
        "outside-position": "auto",
        "caption-position": "inside",
        "caption-max-width": 200,
        "caption-color": "#ffffff",
        "caption-font-size": 20,
        "caption-font-weight": "normal",
        "label-position": "inside",
        "label-color": "#000000",
        "label-background-color": "#ffffff",
        "label-border-color": "#000000",
        "label-border-width": 4,
        "label-font-size": 20,
        "label-padding": 5,
        "label-margin": 4,
        "detail-position": "above",
        "detail-orientation": "parallel",
        "arrow-width": 3,
        "arrow-color": "#848484",
        "margin-start": 5,
        "margin-end": 5,
        "margin-peer": 20,
        "attachment-start": "normal",
        "attachment-end": "normal",
        "type-color": "#848484",
        "type-background-color": "#ffffff",
        "type-border-color": "#000000",
        "type-border-width": 0,
        "type-font-size": 21,
        "type-padding": 5,
        "property-position": "outside",
        "property-color": "#848484",
        "property-font-size": 20,
        "property-font-weight": "normal"
      },
      "nodes": [
        {
          "id": "n0",
          "position": {
            "x": -108,
            "y": 0
          },
          "caption": "Liv Tyler",
          "style": {
            "node-color": "#F79767"
          },
          "labels": [],
          "properties": {}
        },
        {
          "id": "n1",
          "position": {
            "x": 309.5734899055742,
            "y": 0
          },
          "caption": "That thing you do",
          "style": {},
          "labels": [],
          "properties": {}
        }
      ],
      "relationships": [
        {
          "id": "n0",
          "type": "ACTED IN",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n1"
        }
      ]
    }
  }
]