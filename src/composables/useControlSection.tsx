import { ElMenu, ElMenuItem, ElPopover } from 'element-plus'
export const useControlSection = () => {
  const Template = () => (
    <ElPopover placement="left-end" trigger="hover">
      {{
        reference: () => (
          <ElMenuItem index="4">
            <span class="text-white">模板</span>
          </ElMenuItem>
        ),
        default: () => (
          <ElMenu default-active="2">
            <ElMenuItem index="4">
              <span class="text-white">新建模板</span>
            </ElMenuItem>
            <ElMenuItem index="4">
              <span class="text-white">保存模板</span>
            </ElMenuItem>
            <ElMenuItem index="4">
              <span class="text-white">搜索模板</span>
            </ElMenuItem>
            <ElMenuItem index="4">
              <span class="text-white">取消模板</span>
            </ElMenuItem>
          </ElMenu>
        )
      }}
    </ElPopover>
  )
  const Auto = () => (
    <ElPopover placement="left-end" trigger="hover">
      {{
        reference: () => (
          <ElMenuItem index="4">
            <span class="text-white">自主规划</span>
          </ElMenuItem>
        ),
        default: () => (
          <ElMenu default-active="2">
            <ElMenuItem index="4">
              <span class="text-white">创建路径</span>
            </ElMenuItem>
            <ElMenuItem index="4">
              <span class="text-white">下发任务</span>
            </ElMenuItem>
            <ElMenuItem index="4">
              <span class="text-white">取消路径</span>
            </ElMenuItem>
          </ElMenu>
        )
      }}
    </ElPopover>
  )
  return {
    Template,
    Auto
  }
}
