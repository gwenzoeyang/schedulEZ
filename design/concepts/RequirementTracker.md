concept RequirementTracker [User, Course, Requirement]

purpose  
 track whether a student’s chosen courses fulfill graduation or distribution requirements  

principle  
 progress is recomputed whenever a student’s schedule changes;  
 each requirement has defined rules mapping courses to fulfillment;  
 all requirement states are derived dynamically from these rules  

state  
 a mapping of RequirementStates keyed by (owner, requirement), each with  
  owner User  
  requirement Requirement  
  fulfilled Boolean  
  evidence Set of Course  

actions  

recompute (owner: User, courses: Set of Course)  
 effects update all RequirementStates for owner according to current courses,  
  using rules that evaluate fulfillment and evidence for each requirement  
 notes requirements may be grouped (OR-groups) but are flattened for tracking  

missing (owner: User): (reqs: Set of Requirement)  
 effects return all requirements not yet fulfilled for owner  
 notes if no prior state exists, initializes from rules with an empty course set  

evidenceFor (owner: User, req: Requirement): (courses: Set of Course)  
 requires req is a valid requirement for owner  
 effects return all courses contributing to the fulfillment of req  
 throws if req is not applicable to owner



# Changes Made

When revising the RequirementTracker specification, I wanted to make it clearer how it really works behind the scenes. My implementation uses grouped requirements (like Requirement[][]) and maps each user’s progress using normalized keys. I also added more explanation about the external RequirementRulesLike interface, since that’s what actually defines the fulfillment logic. The actions section — recompute, missing, and evidenceFor — now better describe the actual data flow in the code. I tried to keep it simple but still accurate, showing that it’s rule-based and automatically recomputes progress whenever the course set changes.