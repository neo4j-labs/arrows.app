import {EntitySelection, Graph, Relationship} from '@neo4j-arrows/model'
import {VisualNode} from './VisualNode';
import { VisualAttachment } from './VisualAttachment';

export class ResolvedRelationship {
  type: any;
  // id(selection: EntitySelection, id: any): any {
  //   throw new Error("Method not implemented.");
  // }
  get id() { return this.relationship.id}
  constructor(
    readonly relationship:Relationship, 
    readonly from:VisualNode, 
    readonly to:VisualNode, 
    readonly startAttachment:VisualAttachment, 
    readonly endAttachment:VisualAttachment, 
    readonly selected:boolean,
    readonly graph:Graph
  ) {}
}