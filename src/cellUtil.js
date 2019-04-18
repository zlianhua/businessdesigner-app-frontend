const _ = require('lodash');
export default {
  findCellById(cellId, cells){
    var returnCell = null;
    _.each(cells, function(cell) {
      if (cell.id === cellId){
        returnCell = cell;
        return returnCell;
      }
    });
    return returnCell;
  },
  findParentEntity: function(entityId, entityMap, linkMap){
    let parentEntity = null;
    for (let [, v] of linkMap){
      if (v.sourceId === entityId && v.type === "Generalization"){
        parentEntity = entityMap.get(v.targetId);
        return parentEntity;
      }
    }
    return parentEntity;
  },

  findAttributesOfSuper: function(entityId, attributes, isAddSuperAttr, entityMap, linkMap){
    let parent = this.findParentEntity(entityId, entityMap, linkMap);
    if (parent != null){
      attributes = this.findAttributesOfSuper(parent.id, attributes, true, entityMap, linkMap);
    }
    if (isAddSuperAttr){
      let entity = entityMap.get(entityId);
      attributes = entity.attributes.concat(attributes);
    }
    return attributes;
  },

  findRelateEntities: function(entity, relateEntities, entityMap, linkMap){
    for (let [, v] of linkMap){
      if (v.targetId === entity.id && (v.type === "Aggregation" || v.type === "Composition")){
        let source = entityMap.get(v.sourceId);
        let relateEntity = {
          entity:source,
          parentEntity:entity
        }
        relateEntities.push(relateEntity);
        relateEntities = this.findRelateEntities(source, relateEntities, entityMap, linkMap);
      }
    }
    return relateEntities;
  },
  buildParentEntityName(relatesMap, relateEntity, parentEntityName){
    if (relateEntity.parentEntity){
      let parentRelateEntity = relatesMap.get(relateEntity.parentEntity.name);
      if (parentRelateEntity){
        return this.buildParentEntityName(relatesMap, parentRelateEntity, parentEntityName);
      }
      return relateEntity.parentEntity.name + "." + parentEntityName;
    }
  },
  createParameters(editClass, entityMap, linkMap){
    var parameters = [];
    var attributes = editClass.attributes;
    attributes = this.findAttributesOfSuper(editClass.id, attributes, false, entityMap, linkMap);
    _.each(attributes, function(attr){
      if (!attr.isPrimary){
        var enums = [];
        if (attr.attrEnum){
          enums = attr.attrEnum.enums;
        }
        var parameter = {
          isParameter:false,
          relateName:"",
          name:attr.name,
          valueFrom:"",
          value:"",
          enums:enums
        }
        parameters.push(parameter);
      }
    });
    var relateEntities = [];
    relateEntities = this.findRelateEntities(editClass, relateEntities, entityMap, linkMap);
    var relatesMap = new Map();
    for (let aRel of relateEntities){
      relatesMap.set(aRel.entity.name, aRel);
    }
    for (let relatEntity of relateEntities){
      var parentEntityName = "";
      if (relatEntity.parentEntity){
        parentEntityName = this.buildParentEntityName(relatesMap, relatEntity, parentEntityName);
      }
      if (parentEntityName && parentEntityName !== "" && !parentEntityName.endsWith(".")){
        parentEntityName += ".";
      }
      for (let attr of relatEntity.entity.attributes){
        if (attr.isPrimary){
          continue;
        }
        if (attr.name && attr.name !== ""){
          var relateName = parentEntityName + relatEntity.entity.name + "." + attr.name;
          var enums = [];
          if (attr.attrEnum){
            enums = attr.attrEnum.enums;
          }
          var parameter = {
            isParameter:false,
            relateName:relateName,
            name:attr.name,
            valueFrom:"",
            value:"",
            enums:enums
          }
          parameters.push(parameter);
        }
      }
    }
    return parameters;
  },
  restoreCommandServices(entity, entityMap, linkMap){
    let commandServices = entity.commandServices;
    if (commandServices != null && commandServices.length > 0){
      let parameters = this.createParameters(entity, entityMap, linkMap);
      _.each(commandServices, function(aCommandService){
        let paramMap = new Map();
        for (let param of aCommandService.parameters){
          param.isParameter = true;
          paramMap.set(param.name, param);
        }
        aCommandService.parameters = [];
        for (let param of parameters){
          let existParam = paramMap.get(param.name);
          if (existParam != null){
            param.isParameter = true;
            param.valueFrom = existParam.valueFrom;
            param.value = existParam.value;
            param.relateName = existParam.relateName;
          }
          aCommandService.parameters.push(param);
        }
      });
    }
  },
  restoreQueryServices(newEntity, queryServices, entityMap, linkMap){
    let attributes = newEntity.attributes;
    attributes = this.findAttributesOfSuper(newEntity.id, attributes, false, entityMap, linkMap);
    if (queryServices != null && queryServices.length > 0){
      newEntity.queryServices = [];
      _.each(queryServices, function(aQueryServiceName){
        if (aQueryServiceName != null && aQueryServiceName.trim !== ""){
          let parametersMap = new Map();
          let queryService = {
            name: aQueryServiceName,
            parameters: []
          };
          let paramsStart = aQueryServiceName.indexOf("(") + 1;
          let paramsEnd = aQueryServiceName.indexOf(")");
          let param = aQueryServiceName.substring(paramsStart, paramsEnd);
          let fieldNames = param.split(",");
          let methodFullName = aQueryServiceName.replace(param, "");
          let ppms = methodFullName.split("OrderBy");
          let findString = ppms[0];
          let sortString = ppms[1];
          for (let i = 0; i < fieldNames.length; i++){
            let fieldDataType = fieldNames[i].split(" ")[0];
            let lCurrentFieldName = fieldNames[i].split(" ")[1];
            let currentFieldName = lCurrentFieldName.replace(/\b\w/g, function(l){ return l.toUpperCase() });
            let fieldStart = findString.indexOf(currentFieldName);
            let fieldEnd;
            if (i < fieldNames.length - 1){
              let nextFieldName = fieldNames[i + 1].split(" ")[1];
              nextFieldName = nextFieldName.replace(/\b\w/g, function(l){ return l.toUpperCase() });
              fieldEnd = findString.indexOf(nextFieldName);
            } else {
              fieldEnd = findString.length;
            }
            let fieldCondition = findString.substring(fieldStart, fieldEnd);
            let parameter = {};
            parameter.type = fieldDataType;
            parameter.name = lCurrentFieldName;
            parameter.isParameter = true;
            let sStr = lCurrentFieldName.length;
            if (fieldCondition.endsWith("And")){
              let eStr = fieldCondition.indexOf("And");
              if (eStr > sStr){
                parameter.condition = fieldCondition.substring(sStr, eStr);
              }
              parameter.relation = "And";
            } else if (fieldCondition.endsWith("Or")){
              let eStr = fieldCondition.indexOf("Or");
              if (eStr > sStr){
                parameter.condition = fieldCondition.substring(sStr, eStr);
              }
              parameter.relation = "Or";
            } else {
              parameter.relation = "";
              let eStr = fieldCondition.length;
              if (eStr > sStr){
                parameter.condition = fieldCondition.substring(sStr, eStr);
              }
            }
            parametersMap.set(lCurrentFieldName, parameter);
          }
          for (let aAttr of attributes){
            let aParameter = parametersMap.get(aAttr.name);
            if (!aParameter){
              aParameter = {};
              aParameter.name = aAttr.name;
              aParameter.isParameter = false;
              aParameter.type = aAttr.type;
              aParameter.options = [];
              aParameter.naconditione = "";
              aParameter.relation = "";
              aParameter.sort = "";
            }
            if (sortString){
              let currentFieldName = aAttr.name.replace(/\b\w/g, function(l){ return l.toUpperCase() });
              let sortStart = -1;
              sortStart = sortString.indexOf(currentFieldName);
              if (sortStart >= 0){
                let sortSeq = sortString.substring(sortStart + currentFieldName.length, sortStart + currentFieldName.length + 3);
                if (sortSeq === "Asc"){
                  aParameter.sort = "Asc";
                } else if (sortSeq === "Des"){
                  aParameter.sort = "Desc";
                } else {
                  aParameter.sort = "";
                }
              } else {
                aParameter.sort = "";
              }
            } else {
              aParameter.sort = "";
            }
            queryService.parameters.push(aParameter);
          }
          newEntity.queryServices.push(queryService);
        }
      });
    }
    //return newEntity;
  }
}
