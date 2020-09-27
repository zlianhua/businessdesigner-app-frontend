import { timingSafeEqual } from 'crypto';

const _ = require('lodash');
export default {
  capitalize: function(attr){
    return attr.charAt(0).toUpperCase() + attr.substr(1);
  },
  unCapitalize: function(attr){
    return attr.charAt(0).toLowerCase() + attr.substr(1);
  },
  findCellById: function(cellId, cells){
    let returnCell = null;
    for (let cell of cells){
      if (cell.id === cellId){
        returnCell = cell;
        break;
      }
    }
    return returnCell;
  },
  isExtendsFrom: function(thisEntityId, anotherEntityId, entityMap, linkMap){
    let parentEntity = this.findParentEntity(thisEntityId, entityMap, linkMap);
    if (parentEntity){
      if (parentEntity.id === anotherEntityId){
        return true;
      } else {
        return this.isExtendsFrom(parentEntity.id, anotherEntityId, entityMap, linkMap);
      }
    } else {
      return false;
    }
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
  hasSelfAssociation: function(entityId, linkMap){
    for (let [, v] of linkMap){
      if (v.sourceId === entityId && v.type === "SelfAssociation"){
        return true;
      }
    }
    return false;
  },
  findChildrenEntities: function(entityId, entityMap, linkMap){
    let childrenEntities = [];
    for (let [, v] of linkMap){
      if (v.targetId === entityId && v.type === "Generalization"){
        childrenEntities.push(entityMap.get(v.sourceId));
      }
    }
    return childrenEntities;
  },
  findAttributesOfSuper: function(entityId, attributes, isAddSuperAttr, entityMap, linkMap){
    let parent = this.findParentEntity(entityId, entityMap, linkMap);
    if (parent != null){
      attributes = this.findAttributesOfSuper(parent.id, attributes, true, entityMap, linkMap);
    }
    if (isAddSuperAttr){
      let entity = entityMap.get(entityId);
      for (let attr of entity.attributes){
        attr.superEntityName = entity.name;
      }
      attributes = entity.attributes.concat(attributes);
    }
    return attributes;
  },
  hasRelateEntities: function(relateEntities, entity){
    for (let relateEntity of relateEntities){
      if (relateEntity.entity.id === entity.id){
        return true;
      }
    }
    return false;
  },
  findRelateEntities: function(entity, relateEntities, entityMap, linkMap){
    for (let [, v] of linkMap){
      if (v.targetId === entity.id && (v.type === "Aggregation" || v.type === "Composition")){
        let source = entityMap.get(v.sourceId);
        if (!this.hasRelateEntities(relateEntities, source)){
          let relateEntity = {
            entity:source,
            parentEntity:entity
          }
          relateEntities.push(relateEntity);
          relateEntities = this.findRelateEntities(source, relateEntities, entityMap, linkMap);
        }
      }
      let childrenEntities = this.findChildrenEntities(entity.id, entityMap, linkMap);
      if (childrenEntities != null && childrenEntities.length > 0) {
        for (let child of childrenEntities){
          if (!this.hasRelateEntities(relateEntities, child)){
            let relateEntity = {
              isChildren: true,
              entity:child,
              parentEntity:entity
            }
            relateEntities.push(relateEntity);
            relateEntities = this.findRelateEntities(child, relateEntities, entityMap, linkMap);
          }
        }
      }
    }
    return relateEntities;
  },
  findParentRelateEntities: function(entity, relateEntities, entityMap, linkMap){
    relateEntities = this.findRelateEntities(entity, relateEntities, entityMap, linkMap);
    let parentEntity = this.findParentEntity(entity.id, entityMap, linkMap);
    if (parentEntity){
      relateEntities = this.findParentRelateEntities(parentEntity, relateEntities, entityMap, linkMap);
    }
    return relateEntities;
  },
  buildParentEntityName: function(relatesMap, entity, relateEntity, parentEntityName, entityMap, linkMap){
    if (relateEntity.parentEntity){
      let parentRelateEntity = relatesMap.get(relateEntity.parentEntity.name);
      if (parentRelateEntity){
        if (relateEntity.isChildren){
          parentEntityName = "P|" + parentRelateEntity.entity.name + parentEntityName;
        } else {
          parentEntityName = parentRelateEntity.entity.name + "." + parentEntityName;
        }
        return this.buildParentEntityName(relatesMap, entity, parentRelateEntity, parentEntityName, entityMap, linkMap);
      }
      let isExtends = this.isExtendsFrom(entity.id, relateEntity.parentEntity.id, entityMap, linkMap);  
      if (isExtends){
        return parentEntityName;
      } else {
        return relateEntity.parentEntity.name + "." + parentEntityName;
      }
    }
  },
  findExternalClassAttributes: function(entity, attributes, entityMap, linkMap){
    for (let [, v] of linkMap){
      let attrName;
      if (v.type === "Aggregation" || v.type === "Composition"){
        if (v.targetId === entity.id){
          let source = entityMap.get(v.sourceId);
          if (source.type === "uml.ExternalClass"){
            attrName = source.name;
            let idx = attrName.lastIndexOf(".") + 1;
            attrName = attrName.substr(idx);
            attrName = attrName.charAt(0).toLowerCase() + attrName.substr(1) + "Id";
            attrName = attrName + "List";
          }
        }
      } else {
        if (v.sourceId === entity.id){
          let target = entityMap.get(v.targetId);
          if (target.type === "uml.ExternalClass"){
            attrName = target.name;
            let idx = attrName.lastIndexOf(".") + 1;
            attrName = attrName.substr(idx);
            attrName = attrName.charAt(0).toLowerCase() + attrName.substr(1) + "Id";
          }
        }
      }
      if (attrName){
        let hasThisAttr = false;
        for (let aAttr of attributes){
          if (aAttr.name === attrName){
            hasThisAttr = true;
            break;
          }
        }
        if (!hasThisAttr){
          let attr = {}
          attr.name = attrName;
          attr.type = "Long";
          attributes.push(attr);
        }
      }
    }
    return attributes;
  },
  createParameters: function(editClass, entityMap, linkMap){
    var parameters = [];
    var attributes = [];
    for (let attr of editClass.attributes){
      attributes.push(attr);
    }
    attributes = this.findExternalClassAttributes(editClass, attributes, entityMap, linkMap);
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
          type:attr.type,
          valueFrom:"",
          value:"",
          enums:enums
        }
        if (attr.superEntityName){
          parameter.superEntityName = attr.superEntityName;
        }
        parameters.push(parameter);
      }
    });
    var relateEntities = [];
    relateEntities = this.findRelateEntities(editClass, relateEntities, entityMap, linkMap);
    let parentEntity = this.findParentEntity(editClass.id, entityMap, linkMap);
    if (parentEntity){
      relateEntities = this.findParentRelateEntities(parentEntity, relateEntities, entityMap, linkMap);
    }
    var relatesMap = new Map();
    for (let aRel of relateEntities){
      relatesMap.set(aRel.entity.name, aRel);
    }
    for (let relatEntity of relateEntities){
      var parentEntityName = "";
      if (relatEntity.parentEntity){
        parentEntityName = this.buildParentEntityName(relatesMap, editClass, relatEntity, parentEntityName, entityMap, linkMap);
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
            type:attr.type,
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
  restoreCommandServices: function(entity, entityMap, linkMap){
    let commandServices = entity.commandServices;
    if (commandServices != null && commandServices.length > 0){
      for (let aCommandService of commandServices){
        let parameters = this.createParameters(entity, entityMap, linkMap);
        let paramMap = new Map();
        for (let param of aCommandService.parameters){
          param.isParameter = true;
          let key = param.name;
          if (param.relateName){
            key = param.relateName;
          }
          paramMap.set(key, param);
        }
        aCommandService.parameters = [];
        for (let aParam of parameters){
          let key = aParam.name;
          if (aParam.relateName){
            key = aParam.relateName;
          }
          let existParam = paramMap.get(key);
          if (existParam != null){
            aParam.isParameter = true;
            aParam.type = existParam.type;
            aParam.valueFrom = existParam.valueFrom;
            aParam.value = existParam.value;
            aParam.relateName = existParam.relateName;
          }
          aCommandService.parameters.push(aParam);
        }
      }
    }
  },
  restoreQueryServices: function(newEntity, entityMap, linkMap){
    let attributes = newEntity.attributes;
    let queryServices = newEntity.queryServices;
    attributes = this.findAttributesOfSuper(newEntity.id, attributes, false, entityMap, linkMap);
    if (queryServices != null && queryServices.length > 0){
      for (let queryService of queryServices){
        let parametersMap = new Map();
        for (let param of queryService.parameters){
          parametersMap.set(param.name, param);
        }
        for (let aAttr of attributes){
          let aParameter = parametersMap.get(aAttr.name);
          if (!aParameter){
            aParameter = {};
            aParameter.name = aAttr.name;
            aParameter.isParameter = false;
            aParameter.type = aAttr.type;
            aParameter.options = [];
            aParameter.condition = "";
            aParameter.relation = "";
            aParameter.sort = "";
            aParameter.isNullable = false;
            queryService.parameters.push(aParameter);
          }
        }
      }
    }
  },
  downloadFile: function(content, fileName){
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
  },
  findAttributeByName: function(entity, attrName, entityMap, linkMap){
    let retAttr = null;
    let attributes = entity.attributes;
    attributes = this.findAttributesOfSuper(entity.id, attributes, false, entityMap, linkMap);
    for (let attr of attributes){
      if (attr.name === attrName){
        retAttr = attr;
        break;
      }
    }
    return retAttr;
  },
  findPrimaryAttr: function(entity, entityMap, linkMap){
    let retAttr = null;
    let attributes = entity.attributes;
    attributes = this.findAttributesOfSuper(entity.id, attributes, false, entityMap, linkMap);
    for (let attr of attributes){
      if (attr.isPrimary){
        retAttr = attr;
        break;
      }
    }
    return retAttr;
  },
  findEntityBySimpleName: function(entityMap, entitySimpleName){
    let retEntity = null;
    for (let [, v] of entityMap){
      if (v.name === entitySimpleName){
        retEntity = v;
        break;
      }
    }
    return retEntity;
  }

}
