import approvalToolImg from '../images/ApprovalTool.svg';
import chooseRepositoriesImg from '../images/ChooseRepositories.svg';
import editPullRequestImg from '../images/EditPullRequest.svg';
import generateCatalogInfoImg from '../images/GenerateCatalogInfo.svg';
import trackStatusImg from '../images/TrackStatus.svg';

const logos = new Map<string, any>()
  .set('icon-edit-pullrequest', editPullRequestImg)
  .set('icon-generate-cataloginfo', generateCatalogInfoImg)
  .set('icon-track-status', trackStatusImg)
  .set('icon-choose-repositories', chooseRepositoriesImg)
  .set('icon-approval-tool', approvalToolImg);

export const getImageForIconClass = (iconClass: string): string => {
  return logos.get(iconClass);
};
