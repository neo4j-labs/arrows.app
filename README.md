# [arrows.app](https://arrows.neo4jlabs.com/)

![Arrow.app logo](https://arrows.neo4jlabs.com/arrows_logo.svg)

**🚨 NOTE:** The domain arrows.app is currently unavialable, we're working on restoring access (esp. for locally stored graphs). Sorry for the issues (Expiry/Google/Squarespace). We're planning to permanently move the app to https://arrows.neo4jlabs.com/ 

Web-based tool for drawing pictures of graphs, for use in documents or presentations.

* **Quick:** Intuitive drawing with a mouse.
* **Neo4j Property Graph Model:** Draw nodes, relationships, properties, labels.
* **Fine-grained Styling:** Control sizes, layouts, colors.
* **Export as image:** Use images in documents or presentations.
* **Export as Cypher:** Run Cypher to create graphs in a Neo4j database.

Arrows.app is only for drawing pictures of graphs.
Interested in visualizing your Neo4j graph database instead? Please see our other pages about
[Neo4j Bloom](https://neo4j.com/bloom/),
[Neo4j Browser](https://neo4j.com/developer/neo4j-browser/),
and [Graph Visualization](https://neo4j.com/developer/tools-graph-visualization/) in general.

Arrows.app powered by [Neo4j Labs](https://neo4j.com/labs/).

## Issues and Feedback

To report a problem that needs fixing, please create an [issue](https://github.com/neo4j-labs/arrows.app/issues).

For suggestions and feedback, please start a [discussion](https://github.com/neo4j-labs/arrows.app/discussions).

To chat directly with the developers about contributing code, join us over on [Neo4j Discord #neo4j-arrows](https://discord.gg/neo4j).

---

# Arrows codebase

This repository contains two things:

1) Dependency-free JS code for rendering graphs to Canvas and SVG.
1) A React-Redux app for creating and editing pictures of graphs.

This repository is the logical successor to https://github.com/apcj/arrows but shares
no code at all.

## Key Features

* Quick: Intuitive drawing with a mouse.
* Neo4j Property Graph Model. Explicit support for: nodes, relationships, properties, labels.
* Fine-grained Styling. Control over: sizes, positions, colors.
* Export images. Main intended use is to create images for documents or presentations.
* Export Cypher to create graphs in Neo4j

## Anti-features

_Things this code doesn't do._

* It's not (yet) a library. You can't use this for drawing a graph in some other application.
  But maybe this will be possible in the future. The hope is that in the long term some of the
  advanced rendering features might be widely adopted across Neo4j products.
* No direct connection to a database. There is some (currently disabled) functionality that 
  stores pictures to a Neo4j database. However, it was never the intention that this tool should
  support running queries against a database, or exploring a graphs in the way that is possible
  with Neo4j Browser and Neo4j Bloom.
* There is no automated layout. The user has to drag nodes to where they are wanted.
* Styling is very powerful, but deliberately not semantic like in Browser and Bloom. For example,
  there is no way to say that all nodes with a certain label should have a certain colour.
  Instead the user will have to select all the nodes with that label, then set the colour.

## Current status

In development as an open-source project with core contributors from Neo4j, managed under Neo4j Labs.

## Copyright Notice

Copyright 2017-2023 by Neo4j, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
