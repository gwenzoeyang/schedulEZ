2025-12-08T04:30:33.521532925Z   -> /api/CrossRegTravel/_getTravelRequestStatus
2025-12-08T04:30:33.521538395Z   -> /api/CrossRegTravel/_getStudentTravelRequests
2025-12-08T04:30:33.521551755Z   -> /api/CrossRegTravel/_getCourseTravelRequests
2025-12-08T04:30:33.521623827Z   -> /api/CrossRegTravel/_getBusSchedule
2025-12-08T04:30:33.521628317Z   -> /api/CrossRegTravel/_calculateTravelTime
2025-12-08T04:30:33.521634997Z   -> /api/CrossRegTravel/_findDepartureTime
2025-12-08T04:30:33.521702129Z WARNING - UNVERIFIED ROUTE: /api/LikertSurvey/createSurvey
2025-12-08T04:30:33.521706939Z WARNING - UNVERIFIED ROUTE: /api/LikertSurvey/addQuestion
2025-12-08T04:30:33.521709989Z WARNING - UNVERIFIED ROUTE: /api/LikertSurvey/submitResponse
2025-12-08T04:30:33.521721399Z WARNING - UNVERIFIED ROUTE: /api/LikertSurvey/updateResponse
2025-12-08T04:30:33.5217284Z WARNING - UNVERIFIED ROUTE: /api/LikertSurvey/_getSurveyQuestions
2025-12-08T04:30:33.52176371Z WARNING - UNVERIFIED ROUTE: /api/LikertSurvey/_getSurveyResponses
2025-12-08T04:30:33.52176857Z WARNING - UNVERIFIED ROUTE: /api/LikertSurvey/_getRespondentAnswers
2025-12-08T04:30:33.521828482Z   -> /api/Schedule/_getScheduleById
2025-12-08T04:30:33.521834862Z   -> /api/Schedule/_findSchedules
2025-12-08T04:30:33.521842292Z   -> /api/Schedule/getUserSchedule
2025-12-08T04:30:33.521845072Z   -> /api/Schedule/setAIPreferences
2025-12-08T04:30:33.521873043Z   -> /api/Schedule/suggestCourse
2025-12-08T04:30:33.521875403Z FIX: Please verify routes in: ./src/concepts/Requesting/passthrough.ts
2025-12-08T04:30:33.521905664Z 
2025-12-08T04:30:33.521909214Z 🚀 Requesting server listening for POST requests at base path of /api/*
2025-12-08T04:30:33.522746025Z Listening on http://0.0.0.0:10000/ (http://localhost:10000/)
2025-12-08T04:30:37.269149576Z ==> Your service is live 🎉
2025-12-08T04:30:37.415823715Z ==> 
2025-12-08T04:30:37.496005939Z ==> ///////////////////////////////////////////////////////////
2025-12-08T04:30:37.581822502Z ==> 
2025-12-08T04:30:37.671653065Z ==> Available at your primary URL https://schedulez-back.onrender.com
2025-12-08T04:30:37.763375918Z ==> 
2025-12-08T04:30:37.855372011Z ==> ///////////////////////////////////////////////////////////
2025-12-08T04:32:28.376673834Z 
2025-12-08T04:32:28.376730445Z Schedule.setAIPreferences {
2025-12-08T04:32:28.376737536Z   userId: 'default-user',
2025-12-08T04:32:28.376743365Z   major: 'Undeclared',
2025-12-08T04:32:28.376748736Z   interests: [ 'General' ],
2025-12-08T04:32:28.376754416Z   availability: [ 'M', 'T', 'W', 'R', 'F' ]
2025-12-08T04:32:28.376764056Z } => { success: true, message: 'AI preferences set successfully' }
2025-12-08T04:32:28.376769206Z 
2025-12-08T04:32:28.515126729Z 🤖 AI: 3 total courses, 1 excluded, 2 candidates remaining
2025-12-08T04:32:28.522529895Z 
2025-12-08T04:32:28.522548595Z Schedule.suggestCourse { userId: 'default-user', excludeCourseIds: [ 'CS 230-01' ] } => {
2025-12-08T04:32:28.522558165Z   success: true,
2025-12-08T04:32:28.522562085Z   suggestion: {
2025-12-08T04:32:28.522566495Z     courseID: 'CS 231-01',
2025-12-08T04:32:28.522571056Z     title: 'Design and Analysis of Algorithms',
2025-12-08T04:32:28.522575125Z     instructor: 'Carolyn Andersen',
2025-12-08T04:32:28.522579656Z     DBmeetingTimes: [ 'MR - 11:20 AM - 12:35 PM', 'W - 1:00 PM - 4:00 PM' ],
2025-12-08T04:32:28.522583776Z     meetingTimes: [ [Object], [Object], [Object] ],
2025-12-08T04:32:28.522601576Z     subject: 'CS',
2025-12-08T04:32:28.522604086Z     location: undefined,
2025-12-08T04:32:28.522606326Z     campus: undefined,
2025-12-08T04:32:28.522608646Z     rmp: 'https://www.ratemyprofessors.com/professor/2756316',
2025-12-08T04:32:28.522613146Z     description: 'This course introduces the design and analysis of fundamental algorithms. It focuses on the basic skills needed to design efficient, correct algorithms and mathematically prove these properties. General problem-solving techniques covered: divide-and-conquer, dynamic programming, greediness, and probabilistic algorithms. Topics include: sorting, searching, graph algorithms, optimization, network flows, asymptotic analysis, compression, and NP-completeness.'
2025-12-08T04:32:28.522616927Z   }
2025-12-08T04:32:28.522619807Z }
2025-12-08T04:32:28.522621977Z 
2025-12-08T04:35:40.951609533Z ==> Detected service running on port 10000
2025-12-08T04:35:41.139402366Z ==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
2025-12-08T04:36:14.83418676Z 
2025-12-08T04:36:14.834218751Z Schedule.setAIPreferences {
2025-12-08T04:36:14.834223891Z   userId: 'default-user',
2025-12-08T04:36:14.834228321Z   major: 'cs',
2025-12-08T04:36:14.834233671Z   interests: [ 'math' ],
2025-12-08T04:36:14.834238742Z   availability: [ 'M', 'T', 'W', 'R', 'F' ]
2025-12-08T04:36:14.834243372Z } => { success: true, message: 'AI preferences set successfully' }
2025-12-08T04:36:14.834247742Z 
2025-12-08T04:36:14.942323033Z 🤖 AI: 3 total courses, 2 excluded, 1 candidates remaining
2025-12-08T04:36:14.94299316Z 
2025-12-08T04:36:14.94300735Z Schedule.suggestCourse {
2025-12-08T04:36:14.94301326Z   userId: 'default-user',
2025-12-08T04:36:14.943018311Z   excludeCourseIds: [ 'CS 230-01', 'CS 231-01' ]
2025-12-08T04:36:14.943022971Z } => {
2025-12-08T04:36:14.943027761Z   success: true,
2025-12-08T04:36:14.943032201Z   suggestion: {
2025-12-08T04:36:14.943039171Z     courseID: 'MATH 312-02',
2025-12-08T04:36:14.943060952Z     title: 'Differential Geometry',
2025-12-08T04:36:14.943068742Z     instructor: 'Stanley Chang',
2025-12-08T04:36:14.943074282Z     DBmeetingTimes: [ 'TF - 9:00 AM - 11:00 AM', '' ],
2025-12-08T04:36:14.943079252Z     meetingTimes: [ [Object], [Object] ],
2025-12-08T04:36:14.943083672Z     subject: 'MATH',
2025-12-08T04:36:14.943088242Z     location: undefined,
2025-12-08T04:36:14.943092353Z     campus: undefined,
2025-12-08T04:36:14.943096793Z     rmp: 'https://www.ratemyprofessors.com/professor/81462',
2025-12-08T04:36:14.943103713Z     description: "Differential geometry has two aspects. Classical differential geometry, which shares origins with the beginnings of calculus, is the study of local properties of curves and surfaces. Local properties are those properties which depend only on the behavior of the curve or the surface in a neighborhood of a point. The other aspect is global differential geometry: here we see how these local properties influence the behavior of the entire curve or surface. The main idea is that of curvature. What is curvature? It can be intrinsic or extrinsic. What's the difference? What does it mean to have greater or smaller (or positive or negative) curvature? We will answer these questions for surfaces in three-space, as well as for abstract manifolds. Topics include curvature of curves and surfaces, first and second fundamental forms, equations of Gauss and Codazzi, the fundamental theorem of surfaces, geodesics, and surfaces of constant curvature. "
2025-12-08T04:36:14.943115223Z   }
2025-12-08T04:36:14.943119803Z }
2025-12-08T04:36:14.943123873Z 
2025-12-08T04:36:29.155005398Z 
2025-12-08T04:36:29.15507808Z Schedule.setAIPreferences {
2025-12-08T04:36:29.15508793Z   userId: 'default-user',
2025-12-08T04:36:29.155092411Z   major: 'cs',
2025-12-08T04:36:29.155110101Z   interests: [ 'art' ],
2025-12-08T04:36:29.155114151Z   availability: [ 'M', 'T', 'W', 'R', 'F' ]
2025-12-08T04:36:29.155117351Z } => { success: true, message: 'AI preferences set successfully' }
2025-12-08T04:36:29.155119421Z 
2025-12-08T04:36:29.27785854Z 🤖 AI: 3 total courses, 3 excluded, 0 candidates remaining
2025-12-08T04:36:29.278172968Z 
2025-12-08T04:36:29.278189299Z Schedule.suggestCourse {
2025-12-08T04:36:29.278195519Z   userId: 'default-user',
2025-12-08T04:36:29.278199709Z   excludeCourseIds: [ 'CS 230-01', 'CS 231-01', 'MATH 312-02' ]
2025-12-08T04:36:29.278203489Z } => {
2025-12-08T04:36:29.278207729Z   success: false,
2025-12-08T04:36:29.278211669Z   allCoursesEnrolled: true,
2025-12-08T04:36:29.278216489Z   message: 'All available courses have been added to your schedule'
2025-12-08T04:36:29.278220309Z }
2025-12-08T04:36:29.278223889Z 
2025-12-08T04:39:45.657024402Z 
2025-12-08T04:39:45.657073973Z Schedule.setAIPreferences {
2025-12-08T04:39:45.657082674Z   userId: 'gy101',
2025-12-08T04:39:45.657087484Z   major: 'cs',
2025-12-08T04:39:45.657092284Z   interests: [ 'cs', 'algorithms' ],
2025-12-08T04:39:45.657095204Z   availability: [ 'M', 'T', 'W', 'R', 'F' ]
2025-12-08T04:39:45.657098604Z } => { success: true, message: 'AI preferences set successfully' }
2025-12-08T04:39:45.657101464Z 
2025-12-08T04:39:45.749750808Z 🤖 AI: 3 total courses, 1 excluded, 2 candidates remaining
2025-12-08T04:39:45.750194739Z 
2025-12-08T04:39:45.750206929Z Schedule.suggestCourse { userId: 'gy101', excludeCourseIds: [ 'CS 230-01' ] } => {
2025-12-08T04:39:45.750211969Z   success: true,
2025-12-08T04:39:45.750216429Z   suggestion: {
2025-12-08T04:39:45.750221049Z     courseID: 'CS 231-01',
2025-12-08T04:39:45.75022577Z     title: 'Design and Analysis of Algorithms',
2025-12-08T04:39:45.75022998Z     instructor: 'Carolyn Andersen',
2025-12-08T04:39:45.75023429Z     DBmeetingTimes: [ 'MR - 11:20 AM - 12:35 PM', 'W - 1:00 PM - 4:00 PM' ],
2025-12-08T04:39:45.75023905Z     meetingTimes: [ [Object], [Object], [Object] ],
2025-12-08T04:39:45.75024366Z     subject: 'CS',
2025-12-08T04:39:45.7502476Z     location: undefined,
2025-12-08T04:39:45.75025186Z     campus: undefined,
2025-12-08T04:39:45.75025621Z     rmp: 'https://www.ratemyprofessors.com/professor/2756316',
2025-12-08T04:39:45.750263091Z     description: 'This course introduces the design and analysis of fundamental algorithms. It focuses on the basic skills needed to design efficient, correct algorithms and mathematically prove these properties. General problem-solving techniques covered: divide-and-conquer, dynamic programming, greediness, and probabilistic algorithms. Topics include: sorting, searching, graph algorithms, optimization, network flows, asymptotic analysis, compression, and NP-completeness.'
2025-12-08T04:39:45.750267771Z   }
2025-12-08T04:39:45.750272461Z }
2025-12-08T04:39:45.750276841Z 
2025-12-08T04:41:19.199750885Z 
2025-12-08T04:41:19.199787906Z Schedule.setAIPreferences {
2025-12-08T04:41:19.199794566Z   userId: 'gy101',
2025-12-08T04:41:19.199799426Z   major: 'cs',
2025-12-08T04:41:19.199804907Z   interests: [ 'cs', 'algorithms' ],
2025-12-08T04:41:19.199809267Z   availability: [ 'M', 'T', 'W', 'R', 'F' ]
2025-12-08T04:41:19.199814097Z } => { success: true, message: 'AI preferences set successfully' }
2025-12-08T04:41:19.199818417Z 
2025-12-08T04:41:19.289391443Z 🤖 AI: 3 total courses, 3 excluded, 0 candidates remaining
2025-12-08T04:41:19.289755722Z 
2025-12-08T04:41:19.289769913Z Schedule.suggestCourse {
2025-12-08T04:41:19.289774583Z   userId: 'gy101',
2025-12-08T04:41:19.289791663Z   excludeCourseIds: [ 'CS 230-01', 'CS 231-01', 'MATH 312-02' ]
2025-12-08T04:41:19.289794863Z } => {
2025-12-08T04:41:19.289797613Z   success: false,
2025-12-08T04:41:19.289800813Z   allCoursesEnrolled: true,
2025-12-08T04:41:19.289804034Z   message: 'All available courses have been added to your schedule'
2025-12-08T04:41:19.289806683Z }
2025-12-08T04:41:19.289809043Z 