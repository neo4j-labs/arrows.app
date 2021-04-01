import {connect} from "react-redux"
import ImportModal from "../components/ImportModal";
import {hideImportDialog} from "../actions/applicationDialogs";
import {importNodesAndRelationships} from "../actions/graph";
import {getPresentGraph} from "../selectors";
import {formats} from "../actions/import";

const mapStateToProps = (state) => {
  const graph = getPresentGraph(state)
  const separation = graph.style.radius * 2.5

  return {
    separation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    tryImport: (text, separation) => {
      let importedGraph

      const format = formats.find(format => format.recognise(text))
      if (format) {
        try {
          importedGraph = format.parse(text, separation)
        } catch (e) {
          return {
            errorMessage: e.toString()
          }
        }
      } else {
        return {
          errorMessage: 'No format found'
        }
      }

      dispatch(importNodesAndRelationships(importedGraph))
      dispatch(hideImportDialog())
      return {}
    },
    onCancel: () =>{
      dispatch(hideImportDialog())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportModal)