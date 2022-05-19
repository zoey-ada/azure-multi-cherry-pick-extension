import * as SDK from "azure-devops-extension-sdk";
import { GitPullRequest, GitCherryPick, IdentityRefWithVote } from "azure-devops-extension-api/Git";
import { IIdentity } from "azure-devops-ui/IdentityPicker";
import { ICherryPickTarget } from "./interfaces";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";

export class Guid {
  static newGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export module Constants {
  // One minute timeout
  export const RequestTimeoutSeconds = 60;
}

export function trimStart(target: string, trim: string): string {
  if (target.startsWith(trim)) {
    return target.slice(trim.length);
  }
  return target;
}

export function spacesValidation(text: string): boolean {
  let trimmed = text.trim();
  return !trimmed.includes(" ");
}

export function formatPrUrl(item: GitPullRequest): string {
  const host = SDK.getHost();

  const baseUrl = item.url.split("/_apis")[0];
  const link = `${baseUrl}/_git/${item.repository.name}/pullrequest/${
    item.pullRequestId
  }`;

  return link;
}

export function formatCherryPickUrl(item: GitCherryPick): string {
  const host = SDK.getHost();

  let refName = trimStart(item.parameters.generatedRefName, "refs/heads/");
  refName = encodeURIComponent(refName);

  const baseUrl = item.url.split("/_apis")[0];
  const link = `${baseUrl}/_git/${
    item.parameters.repository.name
  }?version=GB${refName}`;

  return link;
}

export function findIndex(id: string, array: ICherryPickTarget[]) {
  for (var i = 0; i < array.length; i++) {
    var currentValue = array[i];
    if (currentValue.id == id) {
      return i;
    }
  }
  return -1;
}

export function checkValuesPopulated(array: ICherryPickTarget[]) {
  let emptyValues = false;

  for (var i = 0; i < array.length; i++) {
    var currentValue = array[i];
    if (!currentValue.targetBranch || !currentValue.topicBranch) {
      emptyValues = true;
    }
  }
  return emptyValues;
}

export function hasOwnProperty<X extends {}, Y extends PropertyKey>
	(obj: X, prop: Y): obj is X & Record<Y, unknown> {
	return obj.hasOwnProperty(prop)
}

export function createPrIdentity(reviewer: IdentityRefWithVote): IIdentity {
	let prIdentity = {
		originalData: reviewer,
		displayName: reviewer.displayName,
		entityId: "",
		entityType: "",
		image: reviewer.imageUrl,
		mail: reviewer.uniqueName,
		originDirectory: "",
		originId: "",
	}
	return prIdentity;
}

export function createIdentityRef(reviewer: IIdentity, isRequired: boolean): IdentityRef {
  if (hasOwnProperty(reviewer, "originalData")) {
    let newReviewer = reviewer.originalData as IdentityRefWithVote;
    newReviewer.vote = 0;
    newReviewer.votedFor = [];

    return newReviewer;
  }
  else {
    let newReviewer = {
      displayName: reviewer.displayName || "",
      id: reviewer.localId || "",
      isRequired: isRequired,
      uniqueName: reviewer.mail || "",

      url: "",
      directoryAlias: "",
      imageUrl: "",
      inactive: false,
      isAadIdentity: false,
      isContainer: false,
      isDeletedInOrigin: false,
      profileUrl: "",
      _links: [],
      descriptor: "",
    };
    return newReviewer;
  }
}
