package com.learningapp.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.learningapp.ui.screen.CourseDetailScreen
import com.learningapp.ui.screen.CourseListScreen
import com.learningapp.ui.screen.LearningScreen
import com.learningapp.ui.viewmodel.CourseViewModel
import com.learningapp.ui.viewmodel.LearningViewModel
import org.koin.androidx.compose.koinViewModel

sealed class Screen(val route: String) {
    object CourseList : Screen("course_list")
    object CourseDetail : Screen("course_detail/{courseId}") {
        fun createRoute(courseId: String) = "course_detail/$courseId"
    }
    object Learning : Screen("learning/{courseId}/{unitId}") {
        fun createRoute(courseId: String, unitId: String) = "learning/$courseId/$unitId"
    }
}

@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String = Screen.CourseList.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // 课程列表
        composable(Screen.CourseList.route) {
            val viewModel: CourseViewModel = koinViewModel()
            val uiState by viewModel.courseListState.collectAsState()
            
            CourseListScreen(
                uiState = uiState,
                onCourseClick = { courseId ->
                    navController.navigate(Screen.CourseDetail.createRoute(courseId))
                },
                onRefresh = { viewModel.loadCourseList(refresh = true) },
                onLoadMore = { viewModel.loadMoreCourses() },
                onRetry = { viewModel.retryLoadCourseList() }
            )
        }
        
        // 课程详情
        composable(
            route = Screen.CourseDetail.route,
            arguments = listOf(navArgument("courseId") { type = NavType.StringType })
        ) { backStackEntry ->
            val courseId = backStackEntry.arguments?.getString("courseId") ?: return@composable
            val viewModel: CourseViewModel = koinViewModel()
            val uiState by viewModel.courseDetailState.collectAsState()
            
            // 自动加载课程详情
            LaunchedEffect(courseId) {
                viewModel.loadCourseDetail(courseId)
            }
            
            CourseDetailScreen(
                uiState = uiState,
                onBackClick = { navController.popBackStack() },
                onUnitClick = { unitId ->
                    navController.navigate(Screen.Learning.createRoute(courseId, unitId))
                },
                onStartLearning = {
                    uiState.courseDetail?.units?.firstOrNull()?.let { firstUnit ->
                        navController.navigate(Screen.Learning.createRoute(courseId, firstUnit.id))
                    }
                },
                onRetry = { viewModel.retryLoadCourseDetail(courseId) }
            )
        }
        
        // 学习界面
        composable(
            route = Screen.Learning.route,
            arguments = listOf(
                navArgument("courseId") { type = NavType.StringType },
                navArgument("unitId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val courseId = backStackEntry.arguments?.getString("courseId") ?: return@composable
            val unitId = backStackEntry.arguments?.getString("unitId") ?: return@composable
            
            val viewModel: LearningViewModel = koinViewModel()
            val uiState by viewModel.uiState.collectAsState()
            
            // 加载课程单元
            if (uiState.units.isEmpty()) {
                viewModel.loadCourseUnits(courseId, unitId)
            }
            
            uiState.currentUnit?.let { unit ->
                LearningScreen(
                    unit = unit,
                    onBackClick = { navController.popBackStack() },
                    onNextUnit = { viewModel.goToNextUnit() },
                    onComplete = { viewModel.markCurrentUnitComplete() },
                    hasNextUnit = viewModel.hasNextUnit()
                )
            }
        }
    }
}
