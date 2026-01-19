package com.examai.presentation.common

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable

/**
 * Dialog shown when token expires
 * Prompts user to log in again
 */
@Composable
fun TokenExpiredDialog(
    onDismiss: () -> Unit,
    onConfirm: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("登录已过期")
        },
        text = {
            Text("您的登录已过期，请重新登录以继续使用。")
        },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text("重新登录")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        }
    )
}
